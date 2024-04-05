function createTextNode(text) {
  return {
    type: "TEXT_ELEMENT",
    props: {
      children: [],
      nodeValue: text,
    },
  };
}

function createElement(type, props, ...children) {
  return {
    type: type,
    props: {
      ...props,
      children: children.map((child) => {
        return typeof child === "string" || typeof child === "number"
          ? createTextNode(child)
          : child;
      }),
    },
  };
}

function commit(fiber) {
  if (!fiber) return;

  let fiberParent = fiber.parent;
  while (!fiberParent.dom) {
    fiberParent = fiberParent.parent;
  }
  if (fiber.tag === "update") {
    updateProps(fiber.dom, fiber.props, fiber.alternate?.props);
  } else {
    if (fiber.dom) {
      fiberParent.dom.appendChild(fiber.dom);
    }
  }
  commit(fiber.child);
  commit(fiber.sibling);
}

function commitRoot() {
  commit(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function createDom(type) {
  return type === "TEXT_ELEMENT"
    ? document.createTextNode("")
    : document.createElement(type);
}

function updateProps(dom, nextProps, prevProps) {
  for (const key in prevProps) {
    if (key !== "children") {
      if (typeof nextProps[key] === "undefined") {
        dom.removeAttribute(key);
      }
    }
  }

  for (const key in nextProps) {
    if (key !== "children") {
      if (prevProps[key] !== nextProps[key]) {
        if (key.startsWith("on")) {
          const eventName = key.slice(2).toLowerCase();
          dom.removeEventListener(eventName, prevProps[key]);
          dom.addEventListener(eventName, nextProps[key]);
        } else {
          dom[key] = nextProps[key];
        }
      }
    }
  }
}

function updateChildren(fiber, children) {
  let oldFiber = fiber.alternate?.child;
  let preChildFiber = null;
  children.forEach((child, index) => {
    const isSameType = oldFiber && oldFiber.type === child.type;
    let childFiber = null;
    if (isSameType) {
      childFiber = {
        type: child.type,
        props: child.props,
        dom: oldFiber.dom,
        child: null,
        sibling: null,
        parent: fiber,
        tag: "update",
        alternate: oldFiber,
      };
    } else {
      childFiber = {
        type: child.type,
        props: child.props,
        dom: null,
        child: null,
        sibling: null,
        tag: "add",
        parent: fiber,
      };
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    if (index === 0) {
      fiber.child = childFiber;
    } else {
      preChildFiber.sibling = childFiber;
    }
    preChildFiber = childFiber;
  });
}

function updateFunctionCompoent(fiber) {
  updateChildren(fiber, [fiber.type(fiber.props)]);
}

function updateHostComponent(fiber) {
  if (!fiber.dom) {
    const dom = (fiber.dom = createDom(fiber.type));
    updateProps(dom, fiber.props, {});
  }
  updateChildren(fiber, fiber.props.children);
}

function performanceWorkDom(fiber) {
  const isFunc = typeof fiber.type === "function";
  if (isFunc) {
    updateFunctionCompoent(fiber);
  } else {
    updateHostComponent(fiber);
  }

  if (fiber.child) return fiber.child;
  if (fiber.sibling) return fiber.sibling;

  return fiber?.parent?.sibling;
}

function work(idleDeadline) {
  while (nextWorkOfUnit && idleDeadline.timeRemaining()) {
    // 渲染dom
    const nextWork = performanceWorkDom(nextWorkOfUnit);
    nextWorkOfUnit = nextWork;
  }

  if (!nextWorkOfUnit && wipRoot) {
    // 统一提交Dom
    commitRoot();
  }

  requestIdleCallback(work);
}

requestIdleCallback(work);

let wipRoot = null;
let currentRoot = null;
let nextWorkOfUnit = null;

function update() {
  wipRoot = {
    dom: currentRoot.dom,
    props: currentRoot.props,
    alternate: currentRoot,
  };
  nextWorkOfUnit = wipRoot;
}

export function render(el, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [el],
    },
  };

  nextWorkOfUnit = wipRoot;
}

export default {
  createElement,
  update,
};
