import React from '../core/React.js'
function TextNum({ num }) {
	return <div>num: {num}</div>
}
function Counter(){
	return <TextNum num={2}/>
}
function App() {
  return (
		<div id="app">
			mini-react
			<Counter></Counter>
		</div>
	)
}

export default App;