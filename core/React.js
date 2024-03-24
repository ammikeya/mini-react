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

export function render(el, container) {

	currWork = {
		dom: container,
		props: {
			children: [el]
		}
	}

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
	requestIdleCallback(work)
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
		fiber.parent.dom.appendChild(dom)
	}

	updateChildren(fiber)

	if(fiber.child) return fiber.child
	if(fiber.sibling) return fiber.sibling

	return fiber?.parent?.sibling
}


requestIdleCallback(work)