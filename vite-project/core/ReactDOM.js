
import { render } from './React.js'
export default {
	createRoot(container) {
		return {
			render(el) {
				render(el, container)
			}
		}
	}
}