import ReactFiberReconciler from 'react-reconciler';
import { Namespaces } from './dom-namespaces';
import { Scheduling } from './scheduling';

import {
  createElement,
  createTextElement,
  setValueForProperty,
  setValueForAttribute,
  deleteValueForAttribute,
} from './utils';
import {
  COMMENT_NODE,
  TEXT_NODE,
  ELEMENT_NODE
} from './html-node-type';
const CHILDREN = 'children';
type HostContextDev = {
  namespace: string,
  ancestorInfo: mixed,
};
type HostContextProd = string;
type HostContext = HostContextDev | HostContextProd;
type Container = Element | Document;
type Props = {
  autoFocus?: boolean,
  children?: mixed,
  hidden?: boolean
};
type Instance = Element;
type TextInstance = Text;

function isCustomComponent(tagName: string, props: Object) {
  if (tagName.indexOf('-') === -1) {
    return typeof props.is === 'string';
  }
  switch (tagName) {
    // These are reserved SVG and MathML elements.
    // We don't mind this whitelist too much because we expect it to never grow.
    // The alternative is to track the namespace in a few places which is convoluted.
    // https://w3c.github.io/webcomponents/spec/custom/#custom-elements-core-concepts
    case 'annotation-xml':
    case 'color-profile':
    case 'font-face':
    case 'font-face-src':
    case 'font-face-uri':
    case 'font-face-format':
    case 'font-face-name':
    case 'missing-glyph':
      return false;
    default:
      return true;
  }
}

function setTextContent (node, text) {
  if (text) {
    let firstChild = node.firstChild;

    if (
      firstChild &&
      firstChild === node.lastChild &&
      firstChild.nodeType === TEXT_NODE
    ) {
      firstChild.nodeValue = text;
      return;
    }
  }
  node.textContent = text;
};


function updateDOMProperties(
  domElement: Element,
  updatePayload: Array<any>,
  wasCustomComponentTag: boolean,
  isCustomComponentTag: boolean,
): void {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if(/on[A-Z][a-zA-Z]+/.test(propKey)) {
      const currentListener = domElement.__rdlEventListener;
      const event = propKey.replace('on', '').toLowerCase();
      domElement.removeEventListener(currentListener.event, currentListener.fn);
      domElement.__rdlEventListener = { event, fn: propValue };
      domElement.addEventListener(event, propValue);
    } else if (propKey === 'className') {
      domElement.className = propValue;
    } else if (propKey === 'style') {
      domElement.style = propValue;
    } else if (propKey === CHILDREN) {
      if (typeof propKey === 'string') {
        setTextContent(domElement, propValue);
      } else if (typeof propKey === 'number') {
        setTextContent(domElement, '' + propValue);
      }
    } else if (isCustomComponentTag) {
      if (propValue != null) {
        setValueForAttribute(
          domElement,
          propKey,
          propValue,
        );
      } else {
        deleteValueForAttribute(domElement, propKey);
      }
    } else if (propValue != null) {
      setValueForProperty(domElement, propKey, propValue);
    } else {
      // If we're updating to null or undefined, we should remove the property
      // from the DOM node instead of inadvertently setting to a string. This
      // brings us in line with the same behavior we have on initial render.
      deleteValueForProperty(domElement, propKey);
    }
  }
}

const DOMRenderer = ReactFiberReconciler({
  getRootHostContext(
    rootContainerInstance: Container
  ): HostContext {
    // TODO: Gracefully handle others
    return Namespaces.html;
  },

  getChildHostContext(
    parentHostContext: HostContext,
    type: string
  ) {
    // TODO: Gracefully handle others
    return Namespaces.html;
  },

  getPublicInstance(instance) {
    return instance;
  },

  prepareForCommit(): void {
    // Noop
  },

  resetAfterCommit(): void {
    // Noop. Since prepareForCommit is noop anyways
  },

  createInstance(
    type: string,
    props: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object,
  ): Instance {
    // TODO: validation in dev See https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOM.js#L585
    const parentNamespace = ((hostContext: any): HostContextProd);
    const domElement: Instance = createElement(
      type,
      props,
      rootContainerInstance,
      parentNamespace,
    );
    return domElement;
  },

  appendInitialChild(
    parentInstance: Instance,
    child: Instance | TextInstance,
  ): void {
    parentInstance.appendChild(child);
  },

  finalizeInitialChildren(
    domElement : Instance,
    type : string,
    props : Props,
    rootContainerInstance : Container
  ): boolean {

    for (var propKey in props) {
      var nextProp = props[propKey];
      if (!props.hasOwnProperty(propKey)) {
        continue;
      }

      if(/on[A-Z][a-zA-Z]+/.test(propKey)) {
        const event = propKey.replace('on', '').toLowerCase();
        domElement.__rdlEventListener = { event, fn: nextProp };
        domElement.addEventListener(event, nextProp);
      } else if (propKey === CHILDREN) {
        if (typeof nextProp === 'string') {
          domElement.appendChild(
            createTextElement(nextProp)
          );
        } else if (typeof nextProp === 'number') {
          domElement.appendChild(
            createTextElement('' + nextProp)
          );
        }
      } else if (propKey === 'className') {
        domElement.className = nextProp;
      } else if (propKey === 'style') {
        domElement.style = nextProp;
      } else {
        setValueForProperty(domElement, propKey, nextProp);
      }

    }

    return false;

  },

  prepareUpdate(
    domElement: Instance,
    type: string,
    oldProps: Props,
    newProps: Props,
    rootContainerInstance: Container,
    hostContext: HostContext,
  ): null | Array<mixed> {

    // TODO validation https://github.com/facebook/react/blob/master/packages/react-dom/src/client/ReactDOM.js#L640

    var updatePayload: Array<any> = [];

    for (let propKey in oldProps) {
      if (
        newProps.hasOwnProperty(propKey) ||
          !oldProps.hasOwnProperty(propKey) ||
          oldProps[propKey] == null
      ) {
        continue;
      }

      (updatePayload = updatePayload || []).push(propKey, null);
    }

    for (let propKey in newProps) {

      const newProp = newProps[propKey];
      const oldProp = oldProps != null ? oldProps[propKey] : undefined;
      if (
        !newProps.hasOwnProperty(propKey) ||
          newProp === oldProp ||
          (newProp == null && oldProp == null)
      ) {
        continue;
      }

      if (propKey === CHILDREN) {
        if (
          oldProp !== newProp &&
            (typeof newProp === 'string' || typeof newProp === 'number')
        ) {
          (updatePayload = updatePayload || []).push(propKey, '' + newProp);
        }
      } else {
        // For any other property we always add it to the queue and then we
        // filter it out using the whitelist during the commit.
        (updatePayload = updatePayload || []).push(propKey, newProp);
      }
    }

    return updatePayload;
  },

  shouldSetTextContent(type: string, props: Props): boolean {
    return (
      type === 'textarea' ||
      typeof props.children === 'string' ||
      typeof props.children === 'number' ||
      (typeof props.dangerouslySetInnerHTML === 'object' &&
        props.dangerouslySetInnerHTML !== null &&
        typeof props.dangerouslySetInnerHTML.__html === 'string')
    );
  },

  shouldDeprioritizeSubtree(type: string, props: Props): boolean {
    return !!props.hidden;
  },

  createTextInstance(
    text: string,
    rootContainerInstance: Container,
    hostContext: HostContext,
    internalInstanceHandle: Object,
  ): TextInstance {
    return createTextElement(text, rootContainerInstance);
  },

  mutation: {
    commitMount(
      instance : Instance,
      type : string,
      newProps : Props,
      internalInstanceHandle : Object
    ) {
      // noop
    },
    commitUpdate(
      domElement: Instance,
      updatePayload: Array<mixed>,
      tag: string,
      oldProps: Props,
      newProps: Props,
      internalInstanceHandle: Object,
    ): void {
      // noop
      if (
        tag === 'input' &&
          newProps.type === 'radio' &&
          newProps.name != null
      ) {
        if (newProps.checked !== null) {
          setValueForProperty(domElement, 'checked', nextProp);
        }
      }
      const wasCustomComponentTag = isCustomComponent(tag, oldProps);
      const isCustomComponentTag = isCustomComponent(tag, newProps);
      // Apply the diff.
      updateDOMProperties(
        domElement,
        updatePayload,
        wasCustomComponentTag,
        isCustomComponentTag,
      );
    },

    resetTextContent(domElement: Instance): void {
      domElement.textContent = '';
    },

    commitTextUpdate(
      textInstance: TextInstance,
      oldText: string,
      newText: string,
    ): void {
      textInstance.nodeValue = newText;
    },

    appendChildToContainer(
      container: Container,
      child: Instance | TextInstance,
    ): void {
      container.appendChild(child);
    },

    appendChild(
      container: Container,
      child: Instance | TextInstance,
    ): void {
      container.appendChild(child);
    },

    insertBefore(
      parentInstance: Instance,
      child: Instance | TextInstance,
      beforeChild: Instance | TextInstance,
    ): void {
      parentInstance.insertBefore(child, beforeChild);
    },

    insertInContainerBefore(
      container: Container,
      child: Instance | TextInstance,
      beforeChild: Instance | TextInstance,
    ): void {
      container.insertBefore(child, beforeChild);
    },

        removeChild(
      parentInstance: Instance,
      child: Instance | TextInstance,
    ): void {
      parentInstance.removeChild(child);
    },

    removeChildFromContainer(
      container: Container,
      child: Instance | TextInstance,
    ): void {
      try {
        if (container.nodeType === COMMENT_NODE) {
          (container.parentNode: any).removeChild(child);
        } else {
          container.removeChild(child);
        }
      } catch(e) {
        // TODO
        console.log(e);
      }
    },

  },

  hydration: {
    canHydrateInstance(
      instance: Instance | TextInstance,
      type: string,
      props: Props,
    ): null | Instance {
      if (
        instance.nodeType !== ELEMENT_NODE ||
          type.toLowerCase() !== instance.nodeName.toLowerCase()
      ) {
        return null;
      }
      // This has now been refined to an element node.
      return ((instance: any): Instance);
    },

    canHydrateTextInstance(
      instance: Instance | TextInstance,
      text: string,
    ): null | TextInstance {
      if (text === '' || instance.nodeType !== TEXT_NODE) {
        // Empty strings are not parsed by HTML so there won't be a correct match here.
        return null;
      }
      // This has now been refined to a text node.
      return ((instance: any): TextInstance);
    },

    getNextHydratableSibling(
      instance: Instance | TextInstance,
    ): null | Instance | TextInstance {
      let node = instance.nextSibling;
      // Skip non-hydratable nodes.
      while (
        node &&
        node.nodeType !== ELEMENT_NODE &&
        node.nodeType !== TEXT_NODE
      ) {
        node = node.nextSibling;
      }
      return (node: any);
    },

    getFirstHydratableChild(
      parentInstance: Container | Instance,
    ): null | Instance | TextInstance {
      let next = parentInstance.firstChild;
      // Skip non-hydratable nodes.
      while (
        next &&
          next.nodeType !== ELEMENT_NODE &&
          next.nodeType !== TEXT_NODE
      ) {
        next = next.nextSibling;
      }
      return (next: any);
    },

    hydrateInstance(
      instance: Instance,
      type: string,
      props: Props,
      rootContainerInstance: Container,
      hostContext: HostContext,
      internalInstanceHandle: Object,
    ): null | Array<mixed> {
      const parentNamespace = ((hostContext: any): HostContextProd);
      console.log('>>>>>> hydrateInstance');
      for (var propKey in props) {
        var nextProp = props[propKey];
        if (!props.hasOwnProperty(propKey)) {
          continue;
        }
        console.log(propKey, 'propKey');
        if(/on[A-Z][a-zA-Z]+/.test(propKey)) {
          const event = propKey.replace('on', '').toLowerCase();
          domElement.__rdlEventListener = { event, fn: nextProp };
          domElement.addEventListener(event, nextProp);
        }

      }
      return [];
    },

  },

  scheduleDeferredCallback: Scheduling.rIC,
  cancelDeferredCallback: Scheduling.cIC,
  useSyncScheduling: true,

  now: Scheduling.now,

  unstable_foo() {
    console.log('unstable_foo');
  }

});

const ReactDOM = {
  render(
    element: React$Element<any>,
    container: DOMContainer,
    callback: ?Function,
  ) {
    // return renderSubtreeIntoContainer(
    //   null,
    //   element,
    //   container,
    //   false,
    //   callback,
    // );

    let root = roots.get(container);
    if (!root) {
      root = DOMRenderer.createContainer(container);
      roots.set(container, root);
    }

    DOMRenderer.updateContainer((element : any), root, null, callback);
    return DOMRenderer.getPublicRootInstance(root);
  },
  hydrate(    element: React$Element<any>,
    container: DOMContainer,
    callback: ?Function,
  ) {
    // return renderSubtreeIntoContainer(
    //   null,
    //   element,
    //   container,
    //   false,
    //   callback,
    // );


    let rootSibling;
    while ((rootSibling = container.lastChild)) {
      container.removeChild(rootSibling);
    }



    console.warn('TODO: not a real hydrate method');
    let root = roots.get(container);
    if (!root) {
      root = DOMRenderer.createContainer(container);
      roots.set(container, root);
    }

    DOMRenderer.updateContainer((element : any), root, null, callback);
    return DOMRenderer.getPublicRootInstance(root);
  },

}



const roots = new Map();
const emptyObject = {};

export default ReactDOM;
