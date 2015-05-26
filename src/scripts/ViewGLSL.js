import GLSLView from "dlib/webgl/GLSLView";
import THREE from "THREE";

export default class ViewGLSL extends GLSLView{
  constructor (canvas, fragmentShaderStr) {
    super(canvas, fragmentShaderStr);

    this.textureCanvas = document.createElement("canvas");
    this.textureCanvas.width = this.canvas.width;
    this.textureCanvas.height = this.canvas.height;
    this.textureContext = this.textureCanvas.getContext("2d");
    this.textureContext.fillStyle = "#000";
    this.textureContext.fillRect(0, 0, this.textureCanvas.width, this.textureCanvas.height);

    // document.body.appendChild(this.textureCanvas);
    // this.textureCanvas.style.position = "absolute";
    // this.textureCanvas.style.top = "0px";

    this.camera = new THREE.PerspectiveCamera( 45, this.canvas.width / this.canvas.height, 1, 1000 );
    this.camera.position.set(0, 100, 100);

    this.controls = new THREE.TrackballControls(this.camera);

    let gl = this.gl;
    gl.uniform2f(gl.getUniformLocation(this.program, "uResolution"), this.canvas.width, this.canvas.height);

    gl.uniform1f(gl.getUniformLocation(this.program, "uCamera.near"), this.camera.near);
    gl.uniform1f(gl.getUniformLocation(this.program, "uCamera.far"), this.camera.far);
    gl.uniform1f(gl.getUniformLocation(this.program, "uCamera.fov"), this.camera.fov);


    this.texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  }

  addPolygon (polygon) {
    this.textureContext.fillStyle = `hsl(0, 0%, ${Math.random() * 100}%)`;
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

    this.controls.update();

    this.camera.updateMatrixWorld();
    this.camera.matrixWorldInverse.getInverse( this.camera.matrixWorld );

    gl.uniformMatrix4fv(gl.getUniformLocation(this.program, "uCamera.modelViewMatrix"), false, this.camera.matrixWorldInverse.elements);

    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureCanvas);
    super.update();
  }
}
