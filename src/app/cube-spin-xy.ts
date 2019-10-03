import { ShaderProgram } from './webgl/shader-program';
import { BasicApp } from './basic-app';
import { MyMath } from './webgl/my-math';

export class CubeSpinXY implements BasicApp {

    private gl: WebGL2RenderingContext;
    private width: number;
    private height: number;
    private then = 0;

    private stopped: boolean;

    private shaderProgram: ShaderProgram;

    private squareVAO: WebGLVertexArrayObject;
    private squareVBO: WebGLBuffer;
    private squareIBO: WebGLBuffer;
    private colorVBO: WebGLBuffer;
    private positions: Float32Array;
    private indices: Int32Array;
    private colors: Float32Array;

    private angle = 0;
    private sx = 0.5;
    private sy = 0.5;
    private sz = 0.5;

    constructor(private canvas: HTMLCanvasElement) { }

    private async init() {
        this.stopped = false;

        try {
            this.gl = this.canvas.getContext('webgl2');
        } catch (e) {
            throw new Error('Could not generate WebGL 2.0 context.');
        }

        let vsText: string, fsText: string;
        try {
            const vs = await fetch('../assets/shaders/cube-spin-xy/basic.vert');
            vsText = await vs.text();

            const fs = await fetch('../assets/shaders/cube-spin-xy/basic.frag');
            fsText = await fs.text();
        } catch (e) {
            console.log(e);
        }

        this.shaderProgram = new ShaderProgram(this.gl);
        try {
            this.shaderProgram.loadShaders(vsText, fsText);
        } catch (e) {
            console.log(e);
        }

        try {

            this.onCanvasResized();

            // Clear canvas
            this.gl.clearColor(0.23, 0.58, 0.57, 1.0);
            this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        } catch (e) {
            throw new Error('Could not generate WebGL 2.0 viewport.');
        }
    }

    private initSquareBuffers() {
        this.squareVAO = this.gl.createVertexArray();
        this.gl.bindVertexArray(this.squareVAO);

        this.positions = new Float32Array([
            // Front face
            -1.0, -1.0, 1.0,
            1.0, -1.0, 1.0,
            1.0, 1.0, 1.0,
            -1.0, 1.0, 1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0, 1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, -1.0, -1.0,

            // Top face
            -1.0, 1.0, -1.0,
            -1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
            1.0, -1.0, -1.0,
            1.0, -1.0, 1.0,
            -1.0, -1.0, 1.0,

            // Right face
            1.0, -1.0, -1.0,
            1.0, 1.0, -1.0,
            1.0, 1.0, 1.0,
            1.0, -1.0, 1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0,
            -1.0, 1.0, -1.0,
        ]);

        // To avoid repeating coordinates, instead of using the points directly,
        // we use indices to their positions in the point array
        this.indices = new Int32Array([
            0, 1, 2, 0, 2, 3,    // front
            4, 5, 6, 4, 6, 7,    // back
            8, 9, 10, 8, 10, 11,   // top
            12, 13, 14, 12, 14, 15,   // bottom
            16, 17, 18, 16, 18, 19,   // right
            20, 21, 22, 20, 22, 23,   // left
        ]);

        this.squareVBO = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.squareVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.positions, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(0, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(0);

        this.squareIBO = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.squareIBO);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, this.indices, this.gl.STATIC_DRAW);

        this.colors = new Float32Array([
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,
            1.0, 1.0, 1.0,

            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,
            1.0, 0.0, 0.0,

            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,
            0.0, 1.0, 0.0,

            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,
            0.0, 0.0, 0.0,

            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,
            0.0, 0.0, 1.0,

            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0,
            1.0, 1.0, 0.0
        ]);

        this.colorVBO = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.colorVBO);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, this.colors, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(1, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(1);
    }

    async run() {
        await this.init();

        this.initSquareBuffers();

        requestAnimationFrame(this.drawScene.bind(this));
    }

    async stop() {
        this.stopped = true;
        this.shaderProgram.destroy();
        this.gl.deleteVertexArray(this.squareVAO);
        this.gl.deleteBuffer(this.squareVBO);
        this.gl.deleteBuffer(this.colorVBO);
    }

    drawScene(now: number) {
        if (this.stopped) {
            return;
        }

        // Resize window if necessary
        this.onCanvasResized();

        // Calculate delta time to make animation frame rate independent
        now *= 0.001;   // convert current time to seconds
        const deltaTime = now - this.then;  // get time difference from previous time to current time
        this.then = now; // remember time for the next frame

        this.angle += 50 * deltaTime;    // update rotation based on time
        if (this.angle >= 360) {
            this.angle = 0;
        }

        // Tell WebGL how to convert from clip space to pixels
        this.gl.viewport(0, 0, this.width, this.height);

        // Clear the canvas
        this.gl.clearColor(0.23, 0.58, 0.57, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);

        // Depth Test
        this.gl.enable(this.gl.DEPTH_TEST);

        // Elimination of backward facing faces
        this.gl.enable(this.gl.CULL_FACE);

        let modelmatrix = MyMath.multiplyMatrix3D(MyMath.scale(this.sx, this.sy, this.sz), MyMath.rotate3DX(340));
        modelmatrix = MyMath.multiplyMatrix3D(modelmatrix, MyMath.rotate3DY(this.angle));

        // Draw
        this.shaderProgram.use();
        this.shaderProgram.setUniform1f('u_aspectRatio', this.width / this.height);    // pass WebGL the aspect ratio
        this.shaderProgram.setUniformMatrix4fv('u_model', modelmatrix);    // pass transformation matrix
        this.gl.bindVertexArray(this.squareVAO);      // tell WebGL we want to draw the triangle
        this.gl.drawElements(this.gl.TRIANGLES, 36, this.gl.UNSIGNED_INT, 0);    // params: primitive type, count, type, offset

        // Call draw scene again at the next frame
        requestAnimationFrame(this.drawScene.bind(this));
    }

    onCanvasResized() {
        this.width = this.canvas.clientWidth;
        this.height = this.canvas.clientHeight;

        if (this.canvas.width !== this.width || this.canvas.height !== this.height) {
            this.canvas.width = this.width;
            this.canvas.height = this.height;
        }
    }
}
