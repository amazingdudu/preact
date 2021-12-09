/**
 * Find the closest error boundary to a thrown error and call it
 * 找到离抛出错误最近的错误边界并调用生命周期
 * @param {object} error The thrown value
 * @param {import('../internal').VNode} vnode The vnode that threw
 * the error that was caught (except for unmounting when this parameter
 * is the highest parent that was being unmounted)
 * 最外层的vnode没有parentNode，所以即使抛出异常也不处理
 */
 
export function _catchError(error, vnode) {
	/** @type {import('../internal').Component} */
	let component, ctor, handled;

	for (; (vnode = vnode._parent); ) {
		if ((component = vnode._component) && !component._processingException) {
			try {
				ctor = component.constructor;

				if (ctor && ctor.getDerivedStateFromError != null) {
					// 将抛出的错误作为参数，并返回一个值以更新 state
					component.setState(ctor.getDerivedStateFromError(error));
					handled = component._dirty;
				}

				if (component.componentDidCatch != null) {
					component.componentDidCatch(error);
					handled = component._dirty;
				}

				// This is an error boundary. Mark it as having bailed out, and whether it was mid-hydration.
				if (handled) {
					return (component._pendingError = component);
				}
			} catch (e) {
				error = e;
			}
		}
	}

	throw error;
}
