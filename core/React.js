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

let wipRoot = null;
let currentRoot = null;
let nextWorkOfUnit = null;
let deletions = [];
let wipFiber = null;

function commitRoot() {
  deletions.forEach(commitDeletion);
  commit(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
  deletions = [];
}

function commitDeletion(fiber) {
  if (fiber?.dom) {
    let current = fiber?.parent;
    while (!current.dom) {
      current = current.parent;
    }
    current.dom.removeChild(fiber?.dom);
  } else {
    commitDeletion(fiber.child);
  }
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
  let firstChild = null;
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
      if (child) {
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
        deletions.push(oldFiber);
      }
    }

    if (oldFiber) {
      oldFiber = oldFiber.sibling;
    }
    // 第一个孩子节点可能为false/null 需要在遍历的时候存起来
    if (childFiber && !firstChild) {
      firstChild = childFiber;
    }
    if (index === 0) {
    } else {
      // 第一个孩子节点可能为false/null 所有 preChildFiber 也为null
      if (preChildFiber) {
        preChildFiber.sibling = childFiber;
      }
    }
    if (childFiber) {
      preChildFiber = childFiber;
    }
  });

  // 遍历完成的时候父节点的第一个孩子节点赋值
  fiber.child = firstChild;

  while (oldFiber) {
    deletions.push(oldFiber);
    oldFiber = oldFiber.sibling;
  }
}

function updateFunctionCompoent(fiber) {
  wipFiber = fiber;
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

  let currParent = fiber;
  while (currParent && !currParent?.parent?.sibling) {
    currParent = currParent?.parent;
  }
  return currParent?.parent?.sibling;
}

function work(idleDeadline) {
  while (nextWorkOfUnit && idleDeadline.timeRemaining()) {
    // 渲染dom
    nextWorkOfUnit = performanceWorkDom(nextWorkOfUnit);
    if (wipRoot?.sibling?.type === nextWorkOfUnit?.type) {
      nextWorkOfUnit = null;
    }
  }

  if (!nextWorkOfUnit && wipRoot) {
    // 统一提交Dom
    commitRoot();
  }

  requestIdleCallback(work);
}

requestIdleCallback(work);

function update() {
  let currentFiber = wipFiber;
  return () => {
    wipRoot = {
      ...currentFiber,
      alternate: currentFiber,
    };
    nextWorkOfUnit = wipRoot;
  };
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
