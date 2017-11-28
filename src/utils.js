import {DOCUMENT_NODE, DOCUMENT_FRAGMENT_NODE} from './html-node-type';
import { Namespaces } from './dom-namespaces';

function getOwnerDocumentFromRootContainer(
  rootContainerElement: Element | Document,
): Document {
  return rootContainerElement.nodeType === DOCUMENT_NODE
    ? (rootContainerElement: any)
    : rootContainerElement.ownerDocument;
}

export function createElement(
  type: string,
  props: Object,
  rootContainerElement: Element | Document,
  parentNamespace: string,
) {
  var ownerDocument: Document = getOwnerDocumentFromRootContainer(
    rootContainerElement,
  );
  return ownerDocument.createElementNS(Namespaces.html, type);
};

export function createTextElement(
  text: string,
  rootContainerElement: Element | Document,
): Text {
  return document.createTextNode(text);
  //getOwnerDocumentFromRootContainer(rootContainerElement).createTextNode(
  //    text
  //  );
}

/* eslint-disable max-len */
const ATTRIBUTE_NAME_START_CHAR =
  ':A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD';
/* eslint-enable max-len */
const ATTRIBUTE_NAME_CHAR =
  ATTRIBUTE_NAME_START_CHAR + '\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040';

const ID_ATTRIBUTE_NAME = 'data-reactid';
const ROOT_ATTRIBUTE_NAME = 'data-reactroot';
const VALID_ATTRIBUTE_NAME_REGEX = new RegExp(
  '^[' + ATTRIBUTE_NAME_START_CHAR + '][' + ATTRIBUTE_NAME_CHAR + ']*$',
);

const illegalAttributeNameCache = {};
const validatedAttributeNameCache = {};
function isAttributeNameSafe(attributeName) {
  if (validatedAttributeNameCache.hasOwnProperty(attributeName)) {
    return true;
  }
  if (illegalAttributeNameCache.hasOwnProperty(attributeName)) {
    return false;
  }
  if (VALID_ATTRIBUTE_NAME_REGEX.test(attributeName)) {
    validatedAttributeNameCache[attributeName] = true;
    return true;
  }
  illegalAttributeNameCache[attributeName] = true;
  console.warn('Invalid attribute name: `%s`', attributeName);
  return false;
}


const properties = {};
function getPropertyInfo(name) {
  return properties.hasOwnProperty(name) ? properties[name] : null;
}

export function setValueForAttribute(node, name, value) {
  if (!isAttributeNameSafe(name)) {
    return;
  }
  if (value == null) {
    node.removeAttribute(name);
  } else {
    node.setAttribute(name, '' + value);
  }
}

function shouldAttributeAcceptBooleanValue(name) {
  if (isReservedProp(name)) {
    return true;
  }
  let propertyInfo = getPropertyInfo(name);
  if (propertyInfo) {
    return (
      propertyInfo.hasBooleanValue ||
      propertyInfo.hasStringBooleanValue ||
      propertyInfo.hasOverloadedBooleanValue
    );
  }
  const prefix = name.toLowerCase().slice(0, 5);
  return prefix === 'data-' || prefix === 'aria-';
}

/**
 * Checks whether a property name is a writeable attribute.
 * @method
 */
function shouldSetAttribute(name, value) {
  if (isReservedProp(name)) {
    return false;
  }
  if (
    name.length > 2 &&
    (name[0] === 'o' || name[0] === 'O') &&
    (name[1] === 'n' || name[1] === 'N')
  ) {
    return false;
  }
  if (value === null) {
    return true;
  }
  switch (typeof value) {
    case 'boolean':
      return shouldAttributeAcceptBooleanValue(name);
    case 'undefined':
    case 'number':
    case 'string':
    case 'object':
      return true;
    default:
      // function, symbol
      return false;
  }
}

function shouldIgnoreValue(propertyInfo, value) {
  return (
    value == null ||
    (propertyInfo.hasBooleanValue && !value) ||
    (propertyInfo.hasNumericValue && isNaN(value)) ||
    (propertyInfo.hasPositiveNumericValue && value < 1) ||
    (propertyInfo.hasOverloadedBooleanValue && value === false)
  );
}

/**
 * Deletes the value for a property on a node.
 *
 * @param {DOMElement} node
 * @param {string} name
 */
function deleteValueForProperty(node, name) {
  const propertyInfo = getPropertyInfo(name);
  if (propertyInfo) {
    if (propertyInfo.mustUseProperty) {
      const propName = propertyInfo.propertyName;
      if (propertyInfo.hasBooleanValue) {
        node[propName] = false;
      } else {
        node[propName] = '';
      }
    } else {
      node.removeAttribute(propertyInfo.attributeName);
    }
  } else {
    node.removeAttribute(name);
  }
}

const RESERVED_PROPS = {
  children: true,
  dangerouslySetInnerHTML: true,
  // TODO: This prevents the assignment of defaultValue to regular
  // elements (not just inputs). Now that ReactDOMInput assigns to the
  // defaultValue property -- do we need this?
  defaultValue: true,
  defaultChecked: true,
  innerHTML: true,
  suppressContentEditableWarning: true,
  suppressHydrationWarning: true,
  style: true,
};

function isReservedProp(name) {
  return RESERVED_PROPS.hasOwnProperty(name);
}

export function setValueForProperty(
  node,
  name,
  value
) {
  const propertyInfo = getPropertyInfo(name);
  if (propertyInfo && shouldSetAttribute(name, value)) {
    if (shouldIgnoreValue(propertyInfo, value)) {
      deleteValueForProperty(node, name);
      return;
    } else if (propertyInfo.mustUseProperty) {
      // Contrary to `setAttribute`, object properties are properly
      // `toString`ed by IE8/9.
      node[propertyInfo.propertyName] = value;
    } else {
      const attributeName = propertyInfo.attributeName;
      const namespace = propertyInfo.attributeNamespace;
      // `setAttribute` with objects becomes only `[object]` in IE8/9,
      // ('' + value) makes it output the correct toString()-value.
      if (namespace) {
        node.setAttributeNS(namespace, attributeName, '' + value);
      } else if (
        propertyInfo.hasBooleanValue ||
        (propertyInfo.hasOverloadedBooleanValue && value === true)
      ) {
        node.setAttribute(attributeName, '');
      } else {
        node.setAttribute(attributeName, '' + value);
      }
    }
  } else {
    setValueForAttribute(
      node,
      name,
      shouldSetAttribute(name, value) ? value : null,
    );
    return;
  }
}

export function deleteValueForAttribute(node, name) {
  node.removeAttribute(name);
}
