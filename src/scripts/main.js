const glslify = require("glslify");

import LoopElement from "dlib/dom/LoopElement";
import SubstrateSystem from "dlib/substrate/SubstrateSystem";
import SubstrateDebugRenderer from "dlib/substrate/SubstrateDebugRenderer";
import Edge from "dlib/math/Edge";
import Polygon from "dlib/math/Polygon";

import ViewThree from "./ViewThree";
import ViewGLSL from "./ViewGLSL";

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
    this.view = new ViewGLSL(this.canvas, this.substrateSystem, glslify("./shaders/world.glsl"));

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

XPSubstrateElement.register("xp-substrate", document.currentScript.ownerDocument.querySelector("template"));
