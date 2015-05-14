import LoopElement from "../../bower_components/dlib/dom/LoopElement";
import SubstrateSystem from "../../bower_components/dlib/substrate/SubstrateSystem";
import SubstrateDebugRenderer from "../../bower_components/dlib/substrate/SubstrateDebugRenderer";
import Edge from "../../bower_components/dlib/math/Edge";

class XPSubstrateElement extends LoopElement {

  createdCallback() {
    super.createdCallback();

    this.canvas = this.shadowRoot.querySelector("canvas");
    this.canvas.width = this.offsetWidth;
    this.canvas.height = this.offsetHeight;

    this.context = this.canvas.getContext("2d");

    this.substrateSystem = new SubstrateSystem(this.canvas.width, this.canvas.height, {
      speed: 4,
      // spawnProbabilityRatio: 0
      spawnProbabilityRatio: 0.05
    });

    this.substrateDebugRenderer = new SubstrateDebugRenderer(this.substrateSystem, {
      canvas: this.shadowRoot.querySelector("canvas#debug"),
      // edgesDebug: true,
      // polygonsDebug: true
    });

    this.pointerEdge = new Edge();

    this.substrateSystem.polygonAddedCallback = this.polygonAdded.bind(this);

    this.update();

    // this.substrateSystem.spawnEdge(this.canvas.width * 0.5, this.canvas.height * 0.5, Math.PI * .5);

    this.addEventListener("mousedown", this);
    this.addEventListener("mouseup", this);
  }

  handleEvent (e) {
    super.handleEvent(e);
    switch (e.type) {
      case "mousedown":
        this.pointerEdge.a.set(e.clientX, e.clientY);
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
    this.context.fillStyle = `hsl(${360 * Math.random()}, 100%, 80%)`;
    this.context.beginPath();
    let vertex = polygon.vertices[0];
    this.context.moveTo(vertex.x, vertex.y);
    for (let i = 1; i < polygon.vertices.length; i++) {
      vertex = polygon.vertices[i];
      this.context.lineTo(vertex.x, vertex.y);
    }
    this.context.fill();
  }

  update() {
    super.update();
    this.substrateSystem.update();
    this.substrateDebugRenderer.update();
  }
}

XPSubstrateElement.register("xp-substrate", document.currentScript.ownerDocument.querySelector("template"));
