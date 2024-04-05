export function createElement(type, props, ...children) {
	return {
		type: type,
		props: {
			...props,
			children: children.map(child => {
				return (typeof child === 'string' || typeof child === 'number') ? createTextNode(child) : child
			})
		}
	}
}

export default {
	createElement
}

function createTextNode(text) {
	return {
		type: 'TEXT_ELEMENT',
		props: {
			children: [],
			nodeValue: text
		}
	}
}

let root = null


export function render(el, container) {

	currWork = {
		dom: container,
		props: {
			children: [el]
		}
	}

	root = currWork
	// const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(el.type)
	// for (const key in el.props) {
	// 	if(key !== 'children') {
	// 		dom[key] = el.props[key]
	// 	}
	// }
	// el.props.children.forEach(child => {
	// 	render(child, dom)
	// });
	// container.appendChild(dom)
}

let currWork = null
function work(idleDeadline) {

	while(currWork && idleDeadline.timeRemaining()) {
		// 渲染dom
		const nextWork = performanceWorkDom(currWork)
		currWork = nextWork
	}

	if(!currWork && root) {
		// 统一提交Dom
		commitRoot()
	}

	requestIdleCallback(work)
}

function commitRoot() {
	commit(root.child)
	root = null
}

function commit(fiber) {
	if(!fiber) return

	let fiberParent = fiber.parent
	while(!fiberParent.dom) {
		fiberParent = fiberParent.parent
	}
	if (fiber.dom) {
    fiberParent.dom.appendChild(fiber.dom);
  }
	commit(fiber.child)
	commit(fiber.sibling)
}

function createDom(type) {
	return type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(type)
}

function initProps(props, dom) {
	for (const key in props) {
		if(key !== 'children') {
			dom[key] = props[key]
		}
	}
}

function updateChildren(fiber, children) {

	let preChildFiber = null
	children.forEach((child,index) => {
		const childFiber = {
			type: child.type,
			props: child.props,
			dom: null,
			child: null,
			sibling: null,
			parent: fiber
		}
		if(index === 0) {
			fiber.child = childFiber
		} else {
			preChildFiber.sibling = childFiber
		}
		preChildFiber = childFiber
	});

}

function updateFunctionCompoent(fiber) {
	updateChildren(fiber, [fiber.type(fiber.props)])
}

function updateHostComponent(fiber) {
	if(!fiber.dom) {
		const dom = (fiber.dom = createDom(fiber.type))
		initProps(fiber.props, dom)
	}
	updateChildren(fiber, fiber.props.children)
}

function performanceWorkDom(fiber) {

	const isFunc = typeof fiber.type === 'function'
	if(isFunc) {
		updateFunctionCompoent(fiber)
	} else {
		updateHostComponent(fiber)
	}

	if(fiber.child) return fiber.child
	if(fiber.sibling) return fiber.sibling

	return fiber?.parent?.sibling
}


requestIdleCallback(work)