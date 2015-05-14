import LoopElement from "../../bower_components/dlib/dom/LoopElement";
import SubstrateSystem from "../../bower_components/dlib/substrate/SubstrateSystem";
import SubstrateDebugRenderer from "../../bower_components/dlib/substrate/SubstrateDebugRenderer";
import Edge from "../../bower_components/dlib/math/Edge";

class XPSubstrateElement extends LoopElement {

  createdCallback() {
    super.createdCallback();


    this.canvas = this.shadowRoot.querySelector("canvas#roofs");
    this.canvas.width = this.offsetWidth;
    this.canvas.height = this.offsetHeight;
    this.context = this.canvas.getContext("2d");

    this.canvasGround = this.shadowRoot.querySelector("canvas#ground");
    this.canvasGround.width = this.canvas.width;
    this.canvasGround.height = this.canvas.height;
    this.contextGround = this.canvasGround.getContext("2d");

    this.buildings = [];

    this.substrateSystem = new SubstrateSystem(this.canvas.width, this.canvas.height, {
      speed: 4,
      // spawnProbabilityRatio: 0
      spawnProbabilityRatio: 0.01
    });

    this.substrateDebugRenderer = new SubstrateDebugRenderer(this.substrateSystem, {
      canvas: this.shadowRoot.querySelector("canvas#debug"),
      // edgesDebug: true,
      // polygonsDebug: true
    });

    this.pointerEdge = new Edge();

    this.substrateSystem.polygonAddedCallback = this.polygonAdded.bind(this);

    this.update();

    this.substrateSystem.spawnEdge(this.canvas.width * 0.5, this.canvas.height * 0.5, Math.PI * .5);

    this.addEventListener("mousedown", this);
    this.addEventListener("mouseup", this);
    this.addEventListener("mousemove", this);
  }

  handleEvent(e) {
    super.handleEvent(e);
    switch (e.type) {
      case "mousedown":
        this.pointerEdge.a.set(e.clientX, e.clientY);
        break;
      case "mousemove":
        this.pointerEdge.a.copy(this.pointerEdge.b);
        this.pointerEdge.b.set(e.clientX / this.offsetWidth, e.clientY / this.offsetHeight).multiplyScalar(2).addScalar(-1);
        // console.log(this.pointerEdge.b);
        break;
      case "mouseup":
        this.pointerEdge.b.set(e.clientX, e.clientY);
        this.substrateSystem.spawnEdge(this.pointerEdge.a.x, this.pointerEdge.a.y, this.pointerEdge.angle);
        break;
    }
  }

  polygonAdded(polygon) {
    // if(polygon.vertices.length > 4) {
    //   return;
    // }
    let building = {
      polygon: polygon,
      color: `hsl(${360 * Math.random()}, 100%, 80%)`,
      height: Math.random()
    };
    this.buildings.push(building);
    this.drawBuilding(building, this.contextGround);
  }

  drawBuilding(building, context) {
    context.fillStyle = building.color;
    context.beginPath();
    let vertex = building.polygon.vertices[0];
    context.moveTo(vertex.x, vertex.y);
    for (let i = 1; i < building.polygon.vertices.length; i++) {
      vertex = building.polygon.vertices[i];
      context.lineTo(vertex.x, vertex.y);
    }
    context.fill();
  }

  update() {
    super.update();
    this.substrateSystem.update();

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    for (let building of this.buildings) {
      this.context.save();
      this.context.translate(this.pointerEdge.b.x * 20 * building.height, this.pointerEdge.b.y * 20 * building.height);
      this.drawBuilding(building, this.context);
      this.context.restore();
    }
    // this.substrateDebugRenderer.update();
  }
}

XPSubstrateElement.register("xp-substrate", document.currentScript.ownerDocument.querySelector("template"));
