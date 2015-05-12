import CustomElement from "../../bower_components/dlib/dom/CustomElement";

class XPSubstrateElement extends CustomElement {
  createdCallback() {
    super.createdCallback();
    console.dir(this.shadowRoot.querySelector('canvas'));
  }
}

XPSubstrateElement.register("xp-substrate", document.currentScript.ownerDocument.querySelector('template'));
