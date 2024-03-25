export function createElement(type, props, ...children) {
	return {
		type: type,
		props: {
			...props,
			children: children.map(child => {
				return typeof child === 'string' ? createTextNode(child) : child
			})
		}
	}
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
	fiber.parent.dom.appendChild(fiber.dom)
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

function updateChildren(fiber) {
	let preChildFiber = null
	fiber.props.children.forEach((child,index) => {
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

function performanceWorkDom(fiber) {

	if(!fiber.dom) {
		const dom = (fiber.dom = createDom(fiber.type))
		initProps(fiber.props, dom)
		// fiber.parent.dom.appendChild(dom)
	}

	updateChildren(fiber)

	if(fiber.child) return fiber.child
	if(fiber.sibling) return fiber.sibling

	return fiber?.parent?.sibling
}


requestIdleCallback(work)