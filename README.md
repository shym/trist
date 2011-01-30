# Trist’ − A twisted game of polyominoes

This software is written in the [Objective Caml] language and compiled
to Javascript using [js_of_ocaml]. It is using the [Closure Tools] and
the [O’Closure] binding for the Closure Library.

This software is released under the [CeCILL] license.

## Compiling

The `Makefile` must be configured with the paths to the Closure
Library and Compiler. It also assumes that [js_of_ocaml] and
[O’Closure] are properly installed for `ocamlfind`.

A tiny bug in the types in [O’Closure] must be patched beforehands.



[Objective Caml]:  http://caml.inria.fr/
[js_of_ocaml]:     http://ocsigen.org/js_of_ocaml/
[O’Closure]:       http://ocsigen.org/oclosure/
[Closure Tools]:   http://code.google.com/closure/
[CeCILL]:          http://www.cecill.info/licences/Licence_CeCILL_V2-en.txt
