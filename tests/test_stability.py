"""Pruebas sin receptor físico: importación aislada de dependencias de interfaz y hardware."""
import ast
import pathlib
import unittest

SOURCE = pathlib.Path(__file__).resolve().parents[1] / "opensdr_explorer.py"


class SourceTests(unittest.TestCase):
    def test_syntax(self):
        ast.parse(SOURCE.read_text(encoding="utf-8"))

    def test_frequency_validation(self):
        tree = ast.parse(SOURCE.read_text(encoding="utf-8"))
        import_node = next(node for node in tree.body if isinstance(node, ast.Import) and
                           any(alias.name == "math" for alias in node.names))
        func = next(node for node in tree.body if isinstance(node, ast.FunctionDef)
                    and node.name == "validate_frequency")
        namespace = {}
        exec(compile(ast.Module(body=[import_node, func], type_ignores=[]), str(SOURCE), "exec"), namespace)
        validate = namespace["validate_frequency"]
        self.assertEqual(validate(100.5), 100_500_000)
        for value in ["nan", "inf", -1, 0, 23, 1767]:
            with self.subTest(value=value), self.assertRaises(ValueError):
                validate(value)


if __name__ == "__main__":
    unittest.main()
