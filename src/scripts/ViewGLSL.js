import Matrix4 from "gl-mat4";

import GLSLView from "dlib/webgl/GLSLView";
import Pointer from "dlib/input/Pointer";

export default class ViewGLSL extends GLSLView{
  constructor (canvas, substrateSystem, fragmentShaderStr) {
    super(canvas, fragmentShaderStr);

    this.substrateSystem = substrateSystem;

    this.pointer = Pointer.get(this.canvas);

    this.pointer.normalized.set(.5, 0);

    this.textureCanvas = document.createElement("canvas");
    this.textureCanvas.width = this.substrateSystem.width;
    this.textureCanvas.height = this.substrateSystem.height;
    this.textureContext = this.textureCanvas.getContext("2d");
    this.textureContext.fillStyle = "black";
    this.textureContext.fillRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);

    this.textureBufferCanvas = document.createElement("canvas");
    this.textureBufferCanvas.width = this.textureCanvas.width;
    this.textureBufferCanvas.height = this.textureCanvas.height;
    this.textureBufferContext = this.textureBufferCanvas.getContext("2d");
    this.textureBufferContext.fillStyle = "black";
    this.textureBufferContext.fillRect(0, 0, this.textureBufferCanvas.width, this.textureBufferCanvas.height);

    this.textureCanvas.style.position = "absolute";
    this.textureCanvas.style.top = "0px";
    // document.body.appendChild(this.textureCanvas);

    this.camera = {
      fov: Math.PI / 4,
      aspect: this.canvas.width / this.canvas.height,
      near: 1,
      far: 2000,
      matrix: Matrix4.create(),
      matrixInverse: Matrix4.create()
    };
    Matrix4.translate(this.camera.matrix, this.camera.matrix, [0, 200, 0]);
    Matrix4.rotateX(this.camera.matrix, this.camera.matrix, -Math.PI * .15);
    Matrix4.invert(this.camera.matrixInverse, this.camera.matrix);

    this.time = 0;

    let gl = this.gl;
    gl.uniform2f(gl.getUniformLocation(this.program, "uResolution"), this.canvas.width, this.canvas.height);
    gl.uniform1f(gl.getUniformLocation(this.program, "uCamera.near"), this.camera.near);
    gl.uniform1f(gl.getUniformLocation(this.program, "uCamera.far"), this.camera.far);
    gl.uniform1f(gl.getUniformLocation(this.program, "uCamera.fov"), this.camera.fov);
    gl.uniform1f(gl.getUniformLocation(this.program, "uTime"), this.time);

    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    setInterval(this.spawnEdge.bind(this), 12000);

    this.spawnEdge();
  }

  spawnEdge() {
    this.textureBufferGlobalAplpha = .9;
    setTimeout(() => {
      this.textureBufferGlobalAplpha = 0;
      this.substrateSystem.clear();
      this.substrateSystem.spawnEdge(this.substrateSystem.width * 0.5, this.substrateSystem.height * 0.5, Math.PI * .5);
    }, 2000);
  }

  addPolygon(polygon) {
    if(Math.random() < .1) {
      return;
    }

    // this.textureBufferContext.fillStyle = `hsla(${Math.random() * 360}, 100%, 50%, ${Math.random()})`;
    this.textureBufferContext.fillStyle = `rgb(${Math.floor(Math.random() * 256)}, 0, 0)`;
    let offsetX = this.textureCanvas.width * .5;
    let offsetY = this.textureCanvas.height * .5;
    let lastVertex = polygon.vertices[polygon.vertices.length - 1];
    this.textureBufferContext.beginPath();
    this.textureBufferContext.moveTo(lastVertex.x + offsetX, lastVertex.y + offsetY);
    for (let vertex of polygon.vertices) {
      this.textureBufferContext.lineTo(vertex.x + offsetX, vertex.y + offsetY);
    }
    this.textureBufferContext.fill();
  }

  update () {
    this.textureBufferContext.globalAlpha = this.textureBufferGlobalAplpha;
    this.textureBufferContext.fillStyle = "rgba(0, 0, 0, 1)";
    this.textureBufferContext.fillRect(0, 0, this.textureBufferCanvas.width, this.textureBufferCanvas.height);
    this.textureBufferContext.globalAlpha = 1;

    this.textureContext.globalAlpha = .1;
    this.textureContext.drawImage(this.textureBufferCanvas, 0, 0);

    let gl = this.gl;

    this.time += 0.001;

    this.camera.matrix[12] += (this.pointer.normalized.x * 2 - 1) * 10;
    this.camera.matrix[14] -= (1 - this.pointer.normalized.y) * 10;

    Matrix4.invert(this.camera.matrixInverse, this.camera.matrix);

    gl.uniform1f(gl.getUniformLocation(this.program, "uTime"), this.time);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "uCamera.modelViewMatrix"), false, this.camera.matrixInverse);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureCanvas);
    super.update();
  }
}
