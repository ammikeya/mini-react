console.log('hello world')

// 01: 真实dom
// const dom = document.createElement('div')
// dom.id = "app"
// document.getElementById("root").appendChild(dom)

// const textNode = document.createTextNode('')
// textNode.nodeValue = "mini-react"
// dom.appendChild(textNode)


// 02 虚拟dom
function createElement(type, props, ...children) {
	return {
		type: type,
		props: {
			...props,
			children
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


// 递归创建dom
function render(el, container) {

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

// render({
// 	type: 'div',
// 	props: {
// 		id: 'app',
// 		children: [{
// 			type: 'TEXT_ELEMENT',
// 			props: {
// 				children: [],
// 				nodeValue: 'mini-react'
// 			}
// 		}]
// 	}
// },
// document.getElementById("root")
// )

// 03 用函数创建虚拟dom
// render(createElement('div',{ id: 'app'}, createTextNode('mini-react') ),
// 	document.getElementById("root")
// )

// 04 模仿react官方API

// import React from 'react'
// import ReactDOM from 'react-dom/client'
// import App from './App.tsx'
// import './index.css'

// ReactDOM.createRoot(document.getElementById('root')).render(
//     <App />
// )


// 05 实现react官网APIa
import ReactDOM  from "../core/ReactDOM.js"
import App from './App.jsx'


ReactDOM.createRoot(document.getElementById('root')).render(App)
