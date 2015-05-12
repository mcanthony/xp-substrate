import LoopElement from "../../bower_components/dlib/dom/LoopElement";
import SubstrateSystem from "../../bower_components/dlib/substrate/SubstrateSystem";
import SubstrateDebugRenderer from "../../bower_components/dlib/substrate/SubstrateDebugRenderer";

class XPSubstrateElement extends LoopElement {
  createdCallback() {
    super.createdCallback();

    let canvas = this.shadowRoot.querySelector("canvas");
    canvas.width = this.offsetWidth;
    canvas.height = this.offsetHeight;

    this.substrateSystem = new SubstrateSystem(canvas.width, canvas.height, {
      speed: 10,
      spawnProbabilityRatio: 0.05
    });

    this.substrateDebugRenderer = new SubstrateDebugRenderer(this.substrateSystem, {
      canvas: canvas,
      edgesDebug: false,
      polygonsDebug: false
    });

    this.update();

    this.substrateSystem.addBoid(canvas.width * 0.5, canvas.height * 0.5, Math.PI);
  }
  update() {
    super.update();
    this.substrateSystem.update();
    this.substrateDebugRenderer.update();
  }
}

XPSubstrateElement.register("xp-substrate", document.currentScript.ownerDocument.querySelector("template"));
