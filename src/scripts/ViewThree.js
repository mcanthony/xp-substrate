import THREE from "THREE";

export default class ViewThree {
  constructor(canvas, canvasDebug) {
    this.polygons = [];

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 10000 );

    this.camera.position.z = -500;
    this.camera.position.y = 500;

    this.controls = new THREE.TrackballControls(this.camera);

    let light = new THREE.DirectionalLight();
    light.position.set(-100, 100, 100);
    this.scene.add(light);

    light = new THREE.AmbientLight(0x888888);
    this.scene.add(light);

    this.canvasTexture = new THREE.Texture(canvasDebug);
    this.canvasTexture.generateMipmaps = false;
    this.canvasTexture.minFilter = THREE.LinearFilter;
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(canvas.width, canvas.height), new THREE.MeshBasicMaterial({
      map: this.canvasTexture,
      transparent: true
    }));
    this.plane.rotation.x = -Math.PI * .5;
    this.scene.add(this.plane);

    this.mesh = new THREE.Mesh(new THREE.Geometry(), new THREE.MeshLambertMaterial({
      shading: THREE.FlatShading,
      vertexColors: THREE.FaceColors
    }));
    for (let i = 0; i < 20000; i++) {
      let box = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1));
      this.mesh.geometry.mergeMesh(box);
    }
    this.scene.add(this.mesh);

    this.renderer = new THREE.WebGLRenderer({
      canvas: canvas
    });
    this.renderer.setClearColor(0x000000, 1);
    this.renderer.setSize( window.innerWidth, window.innerHeight );
  }
  addPolygon(polygon) {
    if(polygon.vertices.length !== 4) {
      return;
    }

    let height = 20 + Math.pow(Math.random(), 8) * 80;

    let geometry = new THREE.BoxGeometry(1, 1, 1);
    geometry.vertices[0].x = polygon.vertices[0].x;
    geometry.vertices[0].z = polygon.vertices[0].y;
    geometry.vertices[0].y = 0;
    geometry.vertices[2].x = polygon.vertices[0].x;
    geometry.vertices[2].z = polygon.vertices[0].y;
    geometry.vertices[2].y = height;
    geometry.vertices[1].x = polygon.vertices[1].x;
    geometry.vertices[1].z = polygon.vertices[1].y;
    geometry.vertices[1].y = 0;
    geometry.vertices[3].x = polygon.vertices[1].x;
    geometry.vertices[3].z = polygon.vertices[1].y;
    geometry.vertices[3].y = height;
    geometry.vertices[4].x = polygon.vertices[2].x;
    geometry.vertices[4].z = polygon.vertices[2].y;
    geometry.vertices[4].y = 0;
    geometry.vertices[6].x = polygon.vertices[2].x;
    geometry.vertices[6].z = polygon.vertices[2].y;
    geometry.vertices[6].y = height;
    geometry.vertices[5].x = polygon.vertices[3].x;
    geometry.vertices[5].z = polygon.vertices[3].y;
    geometry.vertices[5].y = 0;
    geometry.vertices[7].x = polygon.vertices[3].x;
    geometry.vertices[7].z = polygon.vertices[3].y;
    geometry.vertices[7].y = height;

    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    let color = 0xffffff * Math.random();

    let verticesOffset = this.polygons.length * 8;
    for (let i = 0; i < 8; i++) {
      this.mesh.geometry.vertices[verticesOffset + i].copy(geometry.vertices[i]);
    }
    let facesOffset = this.polygons.length * 12;
    for (let i = 0; i < 12; i++) {
      let mainMeshFace = this.mesh.geometry.faces[facesOffset + i];
      let meshFace = geometry.faces[i];
      mainMeshFace.normal.copy(meshFace.normal);
      mainMeshFace.color.setHex(color);
      for (let i = 0; i < 3; i++) {
        mainMeshFace.vertexNormals[i].copy(meshFace.vertexNormals[i]);
      }
    }

    this.mesh.geometry.verticesNeedUpdate = true;
    this.mesh.geometry.normalsNeedUpdate = true;
    this.mesh.geometry.colorsNeedUpdate = true;

    this.polygons.push(polygon);
  }
  update() {
    this.canvasTexture.needsUpdate = true;
    this.controls.update();

    this.renderer.render(this.scene, this.camera);
  }
}
