cmd_Release/aminonative.node := ./gyp-mac-tool flock ./Release/linker.lock c++ -bundle -Wl,-search_paths_first -mmacosx-version-min=10.5 -arch x86_64 -L./Release  -o Release/aminonative.node Release/obj.target/aminonative/src/fonts/vector.o Release/obj.target/aminonative/src/fonts/vertex-buffer.o Release/obj.target/aminonative/src/fonts/vertex-attribute.o Release/obj.target/aminonative/src/fonts/texture-atlas.o Release/obj.target/aminonative/src/fonts/texture-font.o Release/obj.target/aminonative/src/fonts/shader.o Release/obj.target/aminonative/src/fonts/mat4.o Release/obj.target/aminonative/src/base.o Release/obj.target/aminonative/src/shaders.o Release/obj.target/aminonative/src/image.o Release/obj.target/aminonative/src/SimpleRenderer.o Release/obj.target/aminonative/src/mac.o -undefined dynamic_lookup -lglfw -ljpeg -lpng -framework OpenGL -framework OpenCL -L/usr/local/Cellar/freetype/2.5.3_1/lib -lfreetype -lz -lbz2 -L/usr/local/Cellar/libpng/1.6.10/lib -lpng16
