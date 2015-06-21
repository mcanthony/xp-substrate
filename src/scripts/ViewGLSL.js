import THREE from "THREE";

import GLSLView from "dlib/webgl/GLSLView";
import Pointer from "dlib/input/Pointer";

export default class ViewGLSL extends GLSLView{
  constructor (canvas, substrateSystem, fragmentShaderStr) {
    super(canvas, fragmentShaderStr);

    this.pointer = Pointer.get(this.canvas);

    this.textureCanvas = document.createElement("canvas");
    this.textureCanvas.width = substrateSystem.width;
    this.textureCanvas.height = substrateSystem.height;
    this.textureContext = this.textureCanvas.getContext("2d");
    this.textureContext.fillStyle = "rgba(255, 255, 255, 0.01)";
    this.textureContext.fillRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);

    this.textureCanvas.style.position = "absolute";
    this.textureCanvas.style.top = "0px";
    // document.body.appendChild(this.textureCanvas);

    this.camera = new THREE.PerspectiveCamera( 45, this.canvas.width / this.canvas.height, 1, 2000 );
    this.camera.position.set(0, 200, 0);
    this.camera.rotation.x = -Math.PI * .15;

    // this.controls = new THREE.TrackballControls(this.camera);

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

    substrateSystem.spawnEdge(substrateSystem.width * 0.5, substrateSystem.height * 0.5, Math.PI * .5);
  }

  addPolygon (polygon) {
    this.textureContext.fillStyle = `hsla(${Math.random() * 360}, 100%, 50%, ${Math.random()})`;
    let offsetX = this.textureCanvas.width * .5;
    let offsetY = this.textureCanvas.height * .5;
    let lastVertex = polygon.vertices[polygon.vertices.length - 1];
    this.textureContext.beginPath();
    this.textureContext.moveTo(lastVertex.x + offsetX, lastVertex.y + offsetY);
    for (let vertex of polygon.vertices) {
      this.textureContext.lineTo(vertex.x + offsetX, vertex.y + offsetY);
    }
    this.textureContext.fill();
  }

  update () {
    let gl = this.gl;

    this.time += 0.001;

    this.camera.position.z += (this.pointer.normalized.y * 2 - 1) * 10;
    this.camera.position.x += (this.pointer.normalized.x * 2 - 1) * 10;

    this.camera.updateMatrixWorld();
    this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld );

    gl.uniform1f(gl.getUniformLocation(this.program, "uTime"), this.time);
    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "uCamera.modelViewMatrix"), false, this.camera.matrixWorldInverse.elements);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureCanvas);
    super.update();
  }
}
