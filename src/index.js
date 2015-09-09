import SHADER from "./shaders/world.glsl!text";

import LoopElement from "dlib/dom/LoopElement.js";
import SubstrateSystem from "dlib/extras/substrate/SubstrateSystem.js";
import SubstrateDebugRenderer from "dlib/extras/substrate/SubstrateDebugRenderer.js";
import Edge from "dlib/math/Edge.js";
import Polygon from "dlib/math/Polygon.js";

import templateContent from "./template.html!text";
let template = document.createElement("template");
template.innerHTML = templateContent;

// import ViewThree from "./ViewThree.js";
import ViewGLSL from "./ViewGLSL.js";

class XPSubstrateElement extends LoopElement {

  createdCallback() {
    super.createdCallback();

    this.canvas = this.shadowRoot.querySelector("canvas#main");
    this.canvas.width = this.offsetWidth;
    this.canvas.height = this.offsetHeight;

    this.substrateSystem = new SubstrateSystem(1024, 1024, {
      speed: 4,
      spawnProbabilityRatio: 0.05
    });

    this.canvasDebug = this.shadowRoot.querySelector("canvas#debug");
    this.substrateDebugRenderer = new SubstrateDebugRenderer(this.substrateSystem, {
      // edgesDebug: true,
      // polygonsDebug: true,
      canvas: this.canvasDebug
    });

    // this.view = new ViewThree(this.canvas, this.canvasDebug);
    this.view = new ViewGLSL(this.canvas, this.substrateSystem, SHADER);

    this.substrateSystem.polygonAddedCallback = this.polygonAdded.bind(this);

    this.pointerEdge = new Edge();

    this.update();

    this.addEventListener("mousedown", this);
    this.addEventListener("mouseup", this);
    this.addEventListener("mousemove", this);
  }

  polygonAdded(polygon) {
    let offsetWidth = this.substrateSystem.width * .5;
    let offsetHeight = this.substrateSystem.height * .5;
    let newPolygon = new Polygon().copy(polygon);
    for (let vertex of newPolygon.vertices) {
      vertex.x -= offsetWidth;
      vertex.y -= offsetHeight;
    }
    this.view.addPolygon(newPolygon);
  }

  handleEvent(e) {
    switch (e.type) {
      case "mousedown":
        this.pointerEdge.a.set(e.clientX, e.clientY);
        break;
      case "mousemove":
        this.pointerEdge.a.copy(this.pointerEdge.b);
        this.pointerEdge.b.set(e.clientX / this.offsetWidth, e.clientY / this.offsetHeight).multiplyScalar(2).addScalar(-1);
        break;
      case "mouseup":
        this.pointerEdge.b.set(e.clientX, e.clientY);
        this.substrateSystem.spawnEdge(this.pointerEdge.a.x, this.pointerEdge.a.y, this.pointerEdge.angle);
        break;
    }
  }

  update() {
    super.update();
    this.substrateSystem.update();
    // this.substrateDebugRenderer.update();

    this.view.update();
  }
}

XPSubstrateElement.register("xp-substrate", template);
