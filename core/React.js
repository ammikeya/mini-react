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

	const dom = el.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(el.type)
	for (const key in el.props) {
		if(key !== 'children') {
			dom[key] = el.props[key]
		}
	}
	el.props.children.forEach(child => {
		render(child, dom)
	});
	container.appendChild(dom)
}