JS_OF_CAML=js_of_ocaml
LIBNAME=js_of_ocaml

COMP=$(JS_OF_CAML)/compiler/$(COMPILER)
OCAMLC=ocamlfind ocamlc -syntax js_of_ocaml -package js_of_ocaml,js_of_ocaml.syntax,oclosure -syntax camlp4o
STDLIB=$(LIBNAME).cma

CLOSURELIBDIR=closure-library-read-only/
CLOSUREBUILDER=$(CLOSURELIBDIR)/closure/bin/build/closurebuilder.py
CLOSURECOMPILERJAR=compiler.jar

TARGETS=trist.js trist_req.js trist-monolithic.js
TEMP_TARGETS=trist_premono.js

all: $(TARGETS)

trist-monolithic.js: trist_premono.js
	$(CLOSUREBUILDER) --root=$(CLOSURELIBDIR) --root=. -i $< --output_mode=compiled --compiler_jar=$(CLOSURECOMPILERJAR) -f "--compilation_level=WHITESPACE_ONLY" > $@

trist_premono.js: trist_req.js trist.js
	echo 'goog.provide("trist");' > $@
	cat $^ >> $@

trist_req.js: trist.js
	ocaml str.cma `ocamlfind query oclosure`/requirements.ml $<

trist.js: trist.byte
	$(JS_OF_CAML) trist.byte $(OPTIONS)

trist.byte: trist.cmo
	$(OCAMLC) -linkpkg -o $@ $(STDLIB) $^

%.cmo: %.ml
	$(OCAMLC) -g -c $<

%.cmi: %.mli $(JS_OF_CAML)/lib/$(STDLIB)
	$(OCAMLC) -g -c $<

clean:
	rm -f *.cm[io] *.byte $(TEMP_TARGETS)

distclean: clean
	rm -f $(TARGETS) 
