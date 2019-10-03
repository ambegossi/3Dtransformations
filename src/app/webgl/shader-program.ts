export class ShaderProgram {

    program: WebGLProgram;

    constructor(private gl: WebGL2RenderingContext) { };

    loadShaders(vertexShader: string, fragmentShader: string) {
        const vs: WebGLShader = this.gl.createShader(this.gl.VERTEX_SHADER);
        const fs: WebGLShader = this.gl.createShader(this.gl.FRAGMENT_SHADER);

        this.gl.shaderSource(vs, vertexShader);
        this.gl.shaderSource(fs, fragmentShader);

        this.compileShader(vs);
        this.compileShader(fs);

        this.program = this.gl.createProgram();
        this.gl.attachShader(this.program, vs);
        this.gl.attachShader(this.program, fs);
        this.gl.linkProgram(this.program);
        if (!this.gl.getProgramParameter(this.program, this.gl.LINK_STATUS)) {
            throw new Error('Problem compiling shader: ' + this.gl.getProgramInfoLog(this.program));
        }

        this.gl.deleteShader(vs);
        this.gl.deleteShader(fs);
    }

    use() {
        if (this.program) {
            this.gl.useProgram(this.program);
        }
    }

    destroy() {
        this.gl.deleteProgram(this.program);
    }

    setUniform1f(name: string, v: number) {
        const loc = this.gl.getUniformLocation(this.program, name);
        this.gl.uniform1f(loc, v);
    }

    setUniform3f(name: string, v: [number, number, number]) {
        const loc = this.gl.getUniformLocation(this.program, name);
        this.gl.uniform3f(loc, ...v);
    }

    setUniformMatrix3fv(name: string, m: Float32Array | number[]) {
        const loc = this.gl.getUniformLocation(this.program, name);
        this.gl.uniformMatrix3fv(loc, false, m);
    }

    setUniformMatrix4fv(name: string, m: Float32Array | number[]) {
        const loc = this.gl.getUniformLocation(this.program, name);
        this.gl.uniformMatrix4fv(loc, false, m);
    }

    private compileShader(shader: WebGLShader) {
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            throw new Error('Problem compiling shader: ' + this.gl.getShaderInfoLog(shader));
        }
    }
}