from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from RestrictedPython import compile_restricted, safe_builtins, safe_globals
from RestrictedPython.Eval import default_guarded_getiter
from RestrictedPython.Guards import safe_globals as rp_safe_globals, guarded_iter_unpack_sequence
import ast
import sys
import json
import threading

app = FastAPI()

# -------------------------------
# CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------
# Request Model
# -------------------------------
class CodeRequest(BaseModel):
    code: str


# -------------------------------
# AST Analyzer
# Detects both literals [] and constructors list()
# -------------------------------
class DataStructureAnalyzer(ast.NodeVisitor):
    def __init__(self):
        self.structures = set()

    def visit_List(self, node):
        self.structures.add("list")
        self.generic_visit(node)

    def visit_Dict(self, node):
        self.structures.add("dict")
        self.generic_visit(node)

    def visit_Set(self, node):
        self.structures.add("set")
        self.generic_visit(node)

    def visit_Tuple(self, node):
        self.structures.add("tuple")
        self.generic_visit(node)

    def visit_Call(self, node):
        constructors = {"list", "dict", "set", "tuple"}
        if isinstance(node.func, ast.Name) and node.func.id in constructors:
            self.structures.add(node.func.id)
        self.generic_visit(node)


# -------------------------------
# Helpers
# -------------------------------
def is_data_structure(val):
    return isinstance(val, (list, dict, set, tuple))


def is_valid_variable(var):
    # Explicit blocklist — only block known internal names
    internal_names = {
        # RestrictedPython injected names
        "object",
        "args",
        "kwargs",
        "_getiter_",
        "_getitem_",
        "_write_",
        "_inplacevar_",
        "__builtins__",
        "__metaclass__",

        # Python module-level internals
        "__name__",
        "__doc__",
        "__package__",
        "__loader__",
        "__spec__",
        "__file__",
        "__cached__",
    }

    if var in internal_names:
        return False

    # Block single underscore prefix — temp/private vars
    # Do NOT block double underscore — needed by Python internals
    if var.startswith("_") and not var.startswith("__"):
        return False

    return True


def make_snapshot(val):
    """
    Converts a value to a stable string for fast comparison.
    Used only for detecting changes — not sent to frontend.
    """
    try:
        if isinstance(val, set):
            return json.dumps(sorted(list(val), key=str))
        elif isinstance(val, tuple):
            return json.dumps(list(val))
        else:
            return json.dumps(val, sort_keys=True)
    except Exception:
        return repr(val)


def serialize_value(val):
    """
    Converts value to a JSON-safe format for the frontend.
    Sets and tuples become lists so frontend bar graph can use them directly.
    """
    if isinstance(val, (set, tuple)):
        return list(val)
    return val


