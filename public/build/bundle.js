
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    const identity = x => x;
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    const is_client = typeof window !== 'undefined';
    let now = is_client
        ? () => window.performance.now()
        : () => Date.now();
    let raf = is_client ? cb => requestAnimationFrame(cb) : noop;

    const tasks = new Set();
    function run_tasks(now) {
        tasks.forEach(task => {
            if (!task.c(now)) {
                tasks.delete(task);
                task.f();
            }
        });
        if (tasks.size !== 0)
            raf(run_tasks);
    }
    /**
     * Creates a new task that runs on each raf frame
     * until it returns a falsy value or is aborted
     */
    function loop(callback) {
        let task;
        if (tasks.size === 0)
            raf(run_tasks);
        return {
            promise: new Promise(fulfill => {
                tasks.add(task = { c: callback, f: fulfill });
            }),
            abort() {
                tasks.delete(task);
            }
        };
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function prevent_default(fn) {
        return function (event) {
            event.preventDefault();
            // @ts-ignore
            return fn.call(this, event);
        };
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function to_number(value) {
        return value === '' ? null : +value;
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    const active_docs = new Set();
    let active = 0;
    // https://github.com/darkskyapp/string-hash/blob/master/index.js
    function hash(str) {
        let hash = 5381;
        let i = str.length;
        while (i--)
            hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
        return hash >>> 0;
    }
    function create_rule(node, a, b, duration, delay, ease, fn, uid = 0) {
        const step = 16.666 / duration;
        let keyframes = '{\n';
        for (let p = 0; p <= 1; p += step) {
            const t = a + (b - a) * ease(p);
            keyframes += p * 100 + `%{${fn(t, 1 - t)}}\n`;
        }
        const rule = keyframes + `100% {${fn(b, 1 - b)}}\n}`;
        const name = `__svelte_${hash(rule)}_${uid}`;
        const doc = node.ownerDocument;
        active_docs.add(doc);
        const stylesheet = doc.__svelte_stylesheet || (doc.__svelte_stylesheet = doc.head.appendChild(element('style')).sheet);
        const current_rules = doc.__svelte_rules || (doc.__svelte_rules = {});
        if (!current_rules[name]) {
            current_rules[name] = true;
            stylesheet.insertRule(`@keyframes ${name} ${rule}`, stylesheet.cssRules.length);
        }
        const animation = node.style.animation || '';
        node.style.animation = `${animation ? `${animation}, ` : ''}${name} ${duration}ms linear ${delay}ms 1 both`;
        active += 1;
        return name;
    }
    function delete_rule(node, name) {
        const previous = (node.style.animation || '').split(', ');
        const next = previous.filter(name
            ? anim => anim.indexOf(name) < 0 // remove specific animation
            : anim => anim.indexOf('__svelte') === -1 // remove all Svelte animations
        );
        const deleted = previous.length - next.length;
        if (deleted) {
            node.style.animation = next.join(', ');
            active -= deleted;
            if (!active)
                clear_rules();
        }
    }
    function clear_rules() {
        raf(() => {
            if (active)
                return;
            active_docs.forEach(doc => {
                const stylesheet = doc.__svelte_stylesheet;
                let i = stylesheet.cssRules.length;
                while (i--)
                    stylesheet.deleteRule(i);
                doc.__svelte_rules = {};
            });
            active_docs.clear();
        });
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function setContext(key, context) {
        get_current_component().$$.context.set(key, context);
    }
    function getContext(key) {
        return get_current_component().$$.context.get(key);
    }
    function hasContext(key) {
        return get_current_component().$$.context.has(key);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }

    let promise;
    function wait() {
        if (!promise) {
            promise = Promise.resolve();
            promise.then(() => {
                promise = null;
            });
        }
        return promise;
    }
    function dispatch(node, direction, kind) {
        node.dispatchEvent(custom_event(`${direction ? 'intro' : 'outro'}${kind}`));
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    const null_transition = { duration: 0 };
    function create_bidirectional_transition(node, fn, params, intro) {
        let config = fn(node, params);
        let t = intro ? 0 : 1;
        let running_program = null;
        let pending_program = null;
        let animation_name = null;
        function clear_animation() {
            if (animation_name)
                delete_rule(node, animation_name);
        }
        function init(program, duration) {
            const d = program.b - t;
            duration *= Math.abs(d);
            return {
                a: t,
                b: program.b,
                d,
                duration,
                start: program.start,
                end: program.start + duration,
                group: program.group
            };
        }
        function go(b) {
            const { delay = 0, duration = 300, easing = identity, tick = noop, css } = config || null_transition;
            const program = {
                start: now() + delay,
                b
            };
            if (!b) {
                // @ts-ignore todo: improve typings
                program.group = outros;
                outros.r += 1;
            }
            if (running_program || pending_program) {
                pending_program = program;
            }
            else {
                // if this is an intro, and there's a delay, we need to do
                // an initial tick and/or apply CSS animation immediately
                if (css) {
                    clear_animation();
                    animation_name = create_rule(node, t, b, duration, delay, easing, css);
                }
                if (b)
                    tick(0, 1);
                running_program = init(program, duration);
                add_render_callback(() => dispatch(node, b, 'start'));
                loop(now => {
                    if (pending_program && now > pending_program.start) {
                        running_program = init(pending_program, duration);
                        pending_program = null;
                        dispatch(node, running_program.b, 'start');
                        if (css) {
                            clear_animation();
                            animation_name = create_rule(node, t, running_program.b, running_program.duration, 0, easing, config.css);
                        }
                    }
                    if (running_program) {
                        if (now >= running_program.end) {
                            tick(t = running_program.b, 1 - t);
                            dispatch(node, running_program.b, 'end');
                            if (!pending_program) {
                                // we're done
                                if (running_program.b) {
                                    // intro — we can tidy up immediately
                                    clear_animation();
                                }
                                else {
                                    // outro — needs to be coordinated
                                    if (!--running_program.group.r)
                                        run_all(running_program.group.c);
                                }
                            }
                            running_program = null;
                        }
                        else if (now >= running_program.start) {
                            const p = now - running_program.start;
                            t = running_program.a + running_program.d * easing(p / running_program.duration);
                            tick(t, 1 - t);
                        }
                    }
                    return !!(running_program || pending_program);
                });
            }
        }
        return {
            run(b) {
                if (is_function(config)) {
                    wait().then(() => {
                        // @ts-ignore
                        config = config();
                        go(b);
                    });
                }
                else {
                    go(b);
                }
            },
            end() {
                clear_animation();
                running_program = pending_program = null;
            }
        };
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.31.0' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    function cubicOut(t) {
        const f = t - 1.0;
        return f * f * f + 1.0;
    }

    function fade(node, { delay = 0, duration = 400, easing = identity }) {
        const o = +getComputedStyle(node).opacity;
        return {
            delay,
            duration,
            easing,
            css: t => `opacity: ${t * o}`
        };
    }
    function fly(node, { delay = 0, duration = 400, easing = cubicOut, x = 0, y = 0, opacity = 0 }) {
        const style = getComputedStyle(node);
        const target_opacity = +style.opacity;
        const transform = style.transform === 'none' ? '' : style.transform;
        const od = target_opacity * (1 - opacity);
        return {
            delay,
            duration,
            easing,
            css: (t, u) => `
			transform: ${transform} translate(${(1 - t) * x}px, ${(1 - t) * y}px);
			opacity: ${target_opacity - (od * u)}`
        };
    }

    /* src/components/Persons/modal.svelte generated by Svelte v3.31.0 */

    const { Object: Object_1 } = globals;
    const file = "src/components/Persons/modal.svelte";

    // (183:2) {#if Component}
    function create_if_block(ctx) {
    	let div3;
    	let div2;
    	let div1;
    	let t;
    	let div0;
    	let component;
    	let div1_transition;
    	let div3_transition;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*closeButton*/ ctx[0] && create_if_block_1(ctx);
    	const component_spread_levels = [/*props*/ ctx[6]];
    	let component_props = {};

    	for (let i = 0; i < component_spread_levels.length; i += 1) {
    		component_props = assign(component_props, component_spread_levels[i]);
    	}

    	component = new /*Component*/ ctx[5]({ props: component_props, $$inline: true });

    	const block = {
    		c: function create() {
    			div3 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			div0 = element("div");
    			create_component(component.$$.fragment);
    			attr_dev(div0, "class", "content svelte-m702wn");
    			attr_dev(div0, "style", /*cssContent*/ ctx[11]);
    			add_location(div0, file, 199, 10, 4471);
    			attr_dev(div1, "class", "window svelte-m702wn");
    			attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
    			add_location(div1, file, 191, 8, 4226);
    			attr_dev(div2, "class", "window-wrap svelte-m702wn");
    			add_location(div2, file, 190, 6, 4175);
    			attr_dev(div3, "class", "bg svelte-m702wn");
    			attr_dev(div3, "style", /*cssBg*/ ctx[9]);
    			add_location(div3, file, 183, 4, 4008);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div2);
    			append_dev(div2, div1);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t);
    			append_dev(div1, div0);
    			mount_component(component, div0, null);
    			/*div2_binding*/ ctx[24](div2);
    			/*div3_binding*/ ctx[25](div3);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(div3, "click", /*handleOuterClick*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;

    			if (/*closeButton*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1(ctx);
    					if_block.c();
    					if_block.m(div1, t);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			const component_changes = (dirty & /*props*/ 64)
    			? get_spread_update(component_spread_levels, [get_spread_object(/*props*/ ctx[6])])
    			: {};

    			component.$set(component_changes);

    			if (!current || dirty & /*cssContent*/ 2048) {
    				attr_dev(div0, "style", /*cssContent*/ ctx[11]);
    			}

    			if (!current || dirty & /*cssWindow*/ 1024) {
    				attr_dev(div1, "style", /*cssWindow*/ ctx[10]);
    			}

    			if (!current || dirty & /*cssBg*/ 512) {
    				attr_dev(div3, "style", /*cssBg*/ ctx[9]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(component.$$.fragment, local);

    			add_render_callback(() => {
    				if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*transitionWindow*/ ctx[3], /*transitionWindowProps*/ ctx[4], true);
    				div1_transition.run(1);
    			});

    			add_render_callback(() => {
    				if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*transitionBg*/ ctx[1], /*transitionBgProps*/ ctx[2], true);
    				div3_transition.run(1);
    			});

    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(component.$$.fragment, local);
    			if (!div1_transition) div1_transition = create_bidirectional_transition(div1, /*transitionWindow*/ ctx[3], /*transitionWindowProps*/ ctx[4], false);
    			div1_transition.run(0);
    			if (!div3_transition) div3_transition = create_bidirectional_transition(div3, /*transitionBg*/ ctx[1], /*transitionBgProps*/ ctx[2], false);
    			div3_transition.run(0);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div3);
    			if (if_block) if_block.d();
    			destroy_component(component);
    			if (detaching && div1_transition) div1_transition.end();
    			/*div2_binding*/ ctx[24](null);
    			/*div3_binding*/ ctx[25](null);
    			if (detaching && div3_transition) div3_transition.end();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(183:2) {#if Component}",
    		ctx
    	});

    	return block;
    }

    // (197:10) {#if closeButton}
    function create_if_block_1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			attr_dev(button, "class", "close svelte-m702wn");
    			add_location(button, file, 197, 12, 4396);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*close*/ ctx[12], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(197:10) {#if closeButton}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let div;
    	let t;
    	let current;
    	let mounted;
    	let dispose;
    	let if_block = /*Component*/ ctx[5] && create_if_block(ctx);
    	const default_slot_template = /*#slots*/ ctx[23].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[22], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (if_block) if_block.c();
    			t = space();
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-m702wn");
    			add_location(div, file, 181, 0, 3980);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			if (if_block) if_block.m(div, null);
    			append_dev(div, t);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window, "keyup", /*handleKeyup*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*Component*/ ctx[5]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*Component*/ 32) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(div, t);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 4194304) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[22], dirty, null, null);
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (if_block) if_block.d();
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Modal", slots, ['default']);
    	let { key = "simple-modal" } = $$props;
    	let { closeButton = true } = $$props;
    	let { closeOnEsc = true } = $$props;
    	let { closeOnOuterClick = true } = $$props;
    	let { transitionBg = fade } = $$props;
    	let { transitionBgProps = { duration: 250 } } = $$props;
    	let { transitionWindow = transitionBg } = $$props;
    	let { transitionWindowProps = transitionBgProps } = $$props;
    	let { styleBg = { top: 0, left: 0 } } = $$props;
    	let { styleWindow = {} } = $$props;
    	let { styleContent = {} } = $$props;
    	let { setContext: setContext$1 = setContext } = $$props;
    	let Component = null;
    	let props = null;
    	let background;
    	let wrap;
    	const camelCaseToDash = str => str.replace(/([a-zA-Z])(?=[A-Z])/g, "$1-").toLowerCase();
    	const toCssString = props => Object.keys(props).reduce((str, key) => `${str}; ${camelCaseToDash(key)}: ${props[key]}`, "");

    	const open = (NewComponent, newProps = {}) => {
    		$$invalidate(5, Component = NewComponent);
    		$$invalidate(6, props = newProps);
    	};

    	const close = () => {
    		$$invalidate(5, Component = null);
    		$$invalidate(6, props = null);
    	};

    	const handleKeyup = ({ key }) => {
    		if (closeOnEsc && Component && key === "Escape") {
    			event.preventDefault();
    			close();
    		}
    	};

    	const handleOuterClick = event => {
    		if (closeOnOuterClick && (event.target === background || event.target === wrap)) {
    			event.preventDefault();
    			close();
    		}
    	};

    	setContext$1(key, { open, close });

    	const writable_props = [
    		"key",
    		"closeButton",
    		"closeOnEsc",
    		"closeOnOuterClick",
    		"transitionBg",
    		"transitionBgProps",
    		"transitionWindow",
    		"transitionWindowProps",
    		"styleBg",
    		"styleWindow",
    		"styleContent",
    		"setContext"
    	];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Modal> was created with unknown prop '${key}'`);
    	});

    	function div2_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			wrap = $$value;
    			$$invalidate(8, wrap);
    		});
    	}

    	function div3_binding($$value) {
    		binding_callbacks[$$value ? "unshift" : "push"](() => {
    			background = $$value;
    			$$invalidate(7, background);
    		});
    	}

    	$$self.$$set = $$props => {
    		if ("key" in $$props) $$invalidate(15, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(0, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(16, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(17, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("transitionBg" in $$props) $$invalidate(1, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(2, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(3, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(4, transitionWindowProps = $$props.transitionWindowProps);
    		if ("styleBg" in $$props) $$invalidate(18, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(19, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(20, styleContent = $$props.styleContent);
    		if ("setContext" in $$props) $$invalidate(21, setContext$1 = $$props.setContext);
    		if ("$$scope" in $$props) $$invalidate(22, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({
    		baseSetContext: setContext,
    		fade,
    		key,
    		closeButton,
    		closeOnEsc,
    		closeOnOuterClick,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		styleBg,
    		styleWindow,
    		styleContent,
    		setContext: setContext$1,
    		Component,
    		props,
    		background,
    		wrap,
    		camelCaseToDash,
    		toCssString,
    		open,
    		close,
    		handleKeyup,
    		handleOuterClick,
    		cssBg,
    		cssWindow,
    		cssContent
    	});

    	$$self.$inject_state = $$props => {
    		if ("key" in $$props) $$invalidate(15, key = $$props.key);
    		if ("closeButton" in $$props) $$invalidate(0, closeButton = $$props.closeButton);
    		if ("closeOnEsc" in $$props) $$invalidate(16, closeOnEsc = $$props.closeOnEsc);
    		if ("closeOnOuterClick" in $$props) $$invalidate(17, closeOnOuterClick = $$props.closeOnOuterClick);
    		if ("transitionBg" in $$props) $$invalidate(1, transitionBg = $$props.transitionBg);
    		if ("transitionBgProps" in $$props) $$invalidate(2, transitionBgProps = $$props.transitionBgProps);
    		if ("transitionWindow" in $$props) $$invalidate(3, transitionWindow = $$props.transitionWindow);
    		if ("transitionWindowProps" in $$props) $$invalidate(4, transitionWindowProps = $$props.transitionWindowProps);
    		if ("styleBg" in $$props) $$invalidate(18, styleBg = $$props.styleBg);
    		if ("styleWindow" in $$props) $$invalidate(19, styleWindow = $$props.styleWindow);
    		if ("styleContent" in $$props) $$invalidate(20, styleContent = $$props.styleContent);
    		if ("setContext" in $$props) $$invalidate(21, setContext$1 = $$props.setContext);
    		if ("Component" in $$props) $$invalidate(5, Component = $$props.Component);
    		if ("props" in $$props) $$invalidate(6, props = $$props.props);
    		if ("background" in $$props) $$invalidate(7, background = $$props.background);
    		if ("wrap" in $$props) $$invalidate(8, wrap = $$props.wrap);
    		if ("cssBg" in $$props) $$invalidate(9, cssBg = $$props.cssBg);
    		if ("cssWindow" in $$props) $$invalidate(10, cssWindow = $$props.cssWindow);
    		if ("cssContent" in $$props) $$invalidate(11, cssContent = $$props.cssContent);
    	};

    	let cssBg;
    	let cssWindow;
    	let cssContent;

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*styleBg*/ 262144) {
    			 $$invalidate(9, cssBg = toCssString(styleBg));
    		}

    		if ($$self.$$.dirty & /*styleWindow*/ 524288) {
    			 $$invalidate(10, cssWindow = toCssString(styleWindow));
    		}

    		if ($$self.$$.dirty & /*styleContent*/ 1048576) {
    			 $$invalidate(11, cssContent = toCssString(styleContent));
    		}
    	};

    	return [
    		closeButton,
    		transitionBg,
    		transitionBgProps,
    		transitionWindow,
    		transitionWindowProps,
    		Component,
    		props,
    		background,
    		wrap,
    		cssBg,
    		cssWindow,
    		cssContent,
    		close,
    		handleKeyup,
    		handleOuterClick,
    		key,
    		closeOnEsc,
    		closeOnOuterClick,
    		styleBg,
    		styleWindow,
    		styleContent,
    		setContext$1,
    		$$scope,
    		slots,
    		div2_binding,
    		div3_binding
    	];
    }

    class Modal extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance, create_fragment, safe_not_equal, {
    			key: 15,
    			closeButton: 0,
    			closeOnEsc: 16,
    			closeOnOuterClick: 17,
    			transitionBg: 1,
    			transitionBgProps: 2,
    			transitionWindow: 3,
    			transitionWindowProps: 4,
    			styleBg: 18,
    			styleWindow: 19,
    			styleContent: 20,
    			setContext: 21
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Modal",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get key() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set key(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeButton() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeButton(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnEsc() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnEsc(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get closeOnOuterClick() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set closeOnOuterClick(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionBgProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionBgProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get transitionWindowProps() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set transitionWindowProps(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleBg() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleBg(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleWindow() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleWindow(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get styleContent() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set styleContent(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get setContext() {
    		throw new Error("<Modal>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set setContext(value) {
    		throw new Error("<Modal>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Persons/person-form.svelte generated by Svelte v3.31.0 */

    const { console: console_1 } = globals;
    const file$1 = "src/components/Persons/person-form.svelte";

    function create_fragment$1(ctx) {
    	let form;
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div8;
    	let div4;
    	let div1;
    	let label0;
    	let t2;
    	let input0;
    	let t3;
    	let div2;
    	let label1;
    	let t5;
    	let input1;
    	let t6;
    	let div3;
    	let label2;
    	let t8;
    	let input2;
    	let t9;
    	let div7;
    	let div5;
    	let label3;
    	let t11;
    	let input3;
    	let t12;
    	let div6;
    	let label4;
    	let t14;
    	let input4;
    	let t15;
    	let button0;
    	let t16;
    	let t17;
    	let button1;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			form = element("form");
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div8 = element("div");
    			div4 = element("div");
    			div1 = element("div");
    			label0 = element("label");
    			label0.textContent = "نام";
    			t2 = space();
    			input0 = element("input");
    			t3 = space();
    			div2 = element("div");
    			label1 = element("label");
    			label1.textContent = "نام خانوادگی";
    			t5 = space();
    			input1 = element("input");
    			t6 = space();
    			div3 = element("div");
    			label2 = element("label");
    			label2.textContent = "شماره تماس";
    			t8 = space();
    			input2 = element("input");
    			t9 = space();
    			div7 = element("div");
    			div5 = element("div");
    			label3 = element("label");
    			label3.textContent = "تامین کننده";
    			t11 = space();
    			input3 = element("input");
    			t12 = space();
    			div6 = element("div");
    			label4 = element("label");
    			label4.textContent = "شهر";
    			t14 = space();
    			input4 = element("input");
    			t15 = space();
    			button0 = element("button");
    			t16 = text(/*_submit*/ ctx[1]);
    			t17 = space();
    			button1 = element("button");
    			button1.textContent = `${/*_close*/ ctx[2]}`;
    			if (img.src !== (img_src_value = "/images/avator.JPG")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$1, 72, 8, 1471);
    			attr_dev(div0, "class", "row");
    			add_location(div0, file$1, 70, 4, 1391);
    			attr_dev(label0, "for", "firstName");
    			attr_dev(label0, "class", "svelte-1cha04m");
    			add_location(label0, file$1, 77, 16, 1617);
    			attr_dev(input0, "type", "text");
    			attr_dev(input0, "name", "firstName");
    			attr_dev(input0, "maxlength", "20");
    			attr_dev(input0, "class", "svelte-1cha04m");
    			add_location(input0, file$1, 78, 16, 1669);
    			attr_dev(div1, "class", "formGroup svelte-1cha04m");
    			add_location(div1, file$1, 76, 12, 1577);
    			attr_dev(label1, "for", "lastName");
    			attr_dev(label1, "class", "svelte-1cha04m");
    			add_location(label1, file$1, 85, 16, 1909);
    			attr_dev(input1, "type", "text");
    			attr_dev(input1, "name", "lastName");
    			attr_dev(input1, "maxlength", "30");
    			attr_dev(input1, "class", "svelte-1cha04m");
    			add_location(input1, file$1, 86, 16, 1968);
    			attr_dev(div2, "class", "formGroup svelte-1cha04m");
    			add_location(div2, file$1, 84, 12, 1869);
    			attr_dev(label2, "for", "phone");
    			attr_dev(label2, "class", "svelte-1cha04m");
    			add_location(label2, file$1, 93, 16, 2206);
    			attr_dev(input2, "type", "number");
    			attr_dev(input2, "name", "phone");
    			attr_dev(input2, "maxlength", "11");
    			attr_dev(input2, "class", "svelte-1cha04m");
    			add_location(input2, file$1, 94, 16, 2260);
    			attr_dev(div3, "class", "formGroup svelte-1cha04m");
    			add_location(div3, file$1, 92, 12, 2166);
    			attr_dev(div4, "class", "col-6");
    			add_location(div4, file$1, 75, 8, 1545);
    			attr_dev(label3, "for", "provider");
    			attr_dev(label3, "class", "svelte-1cha04m");
    			add_location(label3, file$1, 104, 16, 2538);
    			attr_dev(input3, "type", "text");
    			attr_dev(input3, "name", "provider");
    			attr_dev(input3, "maxlength", "30");
    			attr_dev(input3, "class", "svelte-1cha04m");
    			add_location(input3, file$1, 105, 16, 2596);
    			attr_dev(div5, "class", "formGroup svelte-1cha04m");
    			add_location(div5, file$1, 103, 12, 2498);
    			attr_dev(label4, "for", "city");
    			attr_dev(label4, "class", "svelte-1cha04m");
    			add_location(label4, file$1, 112, 16, 2834);
    			attr_dev(input4, "type", "text");
    			attr_dev(input4, "name", "city");
    			attr_dev(input4, "maxlength", "20");
    			attr_dev(input4, "class", "svelte-1cha04m");
    			add_location(input4, file$1, 113, 16, 2881);
    			attr_dev(div6, "class", "formGroup svelte-1cha04m");
    			add_location(div6, file$1, 111, 12, 2794);
    			attr_dev(div7, "class", "col-6");
    			add_location(div7, file$1, 102, 8, 2466);
    			attr_dev(div8, "class", "row");
    			add_location(div8, file$1, 74, 4, 1519);
    			attr_dev(button0, "class", " svelte-1cha04m");
    			add_location(button0, file$1, 122, 4, 3090);
    			attr_dev(button1, "class", " svelte-1cha04m");
    			add_location(button1, file$1, 123, 4, 3130);
    			attr_dev(form, "class", "container svelte-1cha04m");
    			add_location(form, file$1, 69, 0, 1329);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, form, anchor);
    			append_dev(form, div0);
    			append_dev(div0, img);
    			append_dev(form, t0);
    			append_dev(form, div8);
    			append_dev(div8, div4);
    			append_dev(div4, div1);
    			append_dev(div1, label0);
    			append_dev(div1, t2);
    			append_dev(div1, input0);
    			set_input_value(input0, /*personModal*/ ctx[0].firstName);
    			append_dev(div4, t3);
    			append_dev(div4, div2);
    			append_dev(div2, label1);
    			append_dev(div2, t5);
    			append_dev(div2, input1);
    			set_input_value(input1, /*personModal*/ ctx[0].lastName);
    			append_dev(div4, t6);
    			append_dev(div4, div3);
    			append_dev(div3, label2);
    			append_dev(div3, t8);
    			append_dev(div3, input2);
    			set_input_value(input2, /*personModal*/ ctx[0].phone);
    			append_dev(div8, t9);
    			append_dev(div8, div7);
    			append_dev(div7, div5);
    			append_dev(div5, label3);
    			append_dev(div5, t11);
    			append_dev(div5, input3);
    			set_input_value(input3, /*personModal*/ ctx[0].provider);
    			append_dev(div7, t12);
    			append_dev(div7, div6);
    			append_dev(div6, label4);
    			append_dev(div6, t14);
    			append_dev(div6, input4);
    			set_input_value(input4, /*personModal*/ ctx[0].city);
    			append_dev(form, t15);
    			append_dev(form, button0);
    			append_dev(button0, t16);
    			append_dev(form, t17);
    			append_dev(form, button1);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input0, "input", /*input0_input_handler*/ ctx[6]),
    					listen_dev(input1, "input", /*input1_input_handler*/ ctx[7]),
    					listen_dev(input2, "input", /*input2_input_handler*/ ctx[8]),
    					listen_dev(input3, "input", /*input3_input_handler*/ ctx[9]),
    					listen_dev(input4, "input", /*input4_input_handler*/ ctx[10]),
    					listen_dev(button1, "click", prevent_default(/*_onClose*/ ctx[4]), false, true, false),
    					listen_dev(form, "submit", prevent_default(/*_onOk*/ ctx[3]), false, true, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*personModal*/ 1 && input0.value !== /*personModal*/ ctx[0].firstName) {
    				set_input_value(input0, /*personModal*/ ctx[0].firstName);
    			}

    			if (dirty & /*personModal*/ 1 && input1.value !== /*personModal*/ ctx[0].lastName) {
    				set_input_value(input1, /*personModal*/ ctx[0].lastName);
    			}

    			if (dirty & /*personModal*/ 1 && to_number(input2.value) !== /*personModal*/ ctx[0].phone) {
    				set_input_value(input2, /*personModal*/ ctx[0].phone);
    			}

    			if (dirty & /*personModal*/ 1 && input3.value !== /*personModal*/ ctx[0].provider) {
    				set_input_value(input3, /*personModal*/ ctx[0].provider);
    			}

    			if (dirty & /*personModal*/ 1 && input4.value !== /*personModal*/ ctx[0].city) {
    				set_input_value(input4, /*personModal*/ ctx[0].city);
    			}

    			if (dirty & /*_submit*/ 2) set_data_dev(t16, /*_submit*/ ctx[1]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(form);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Person_form", slots, []);
    	let { personModal = {} } = $$props;

    	let { onUpdate = () => {
    		
    	} } = $$props;

    	let _submit = "ثبت";
    	let _close = "انصراف";

    	if (personModal.id !== -1) {
    		_submit = "بروز رسانی";
    	}

    	const { close } = getContext("simple-modal");

    	const _onOk = () => {
    		console.log("update");
    		onUpdate(personModal);
    		close();
    	};

    	const _onClose = () => {
    		console.log("On Close");
    		close();
    	};

    	const writable_props = ["personModal", "onUpdate"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Person_form> was created with unknown prop '${key}'`);
    	});

    	function input0_input_handler() {
    		personModal.firstName = this.value;
    		$$invalidate(0, personModal);
    	}

    	function input1_input_handler() {
    		personModal.lastName = this.value;
    		$$invalidate(0, personModal);
    	}

    	function input2_input_handler() {
    		personModal.phone = to_number(this.value);
    		$$invalidate(0, personModal);
    	}

    	function input3_input_handler() {
    		personModal.provider = this.value;
    		$$invalidate(0, personModal);
    	}

    	function input4_input_handler() {
    		personModal.city = this.value;
    		$$invalidate(0, personModal);
    	}

    	$$self.$$set = $$props => {
    		if ("personModal" in $$props) $$invalidate(0, personModal = $$props.personModal);
    		if ("onUpdate" in $$props) $$invalidate(5, onUpdate = $$props.onUpdate);
    	};

    	$$self.$capture_state = () => ({
    		getContext,
    		personModal,
    		onUpdate,
    		_submit,
    		_close,
    		close,
    		_onOk,
    		_onClose
    	});

    	$$self.$inject_state = $$props => {
    		if ("personModal" in $$props) $$invalidate(0, personModal = $$props.personModal);
    		if ("onUpdate" in $$props) $$invalidate(5, onUpdate = $$props.onUpdate);
    		if ("_submit" in $$props) $$invalidate(1, _submit = $$props._submit);
    		if ("_close" in $$props) $$invalidate(2, _close = $$props._close);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		personModal,
    		_submit,
    		_close,
    		_onOk,
    		_onClose,
    		onUpdate,
    		input0_input_handler,
    		input1_input_handler,
    		input2_input_handler,
    		input3_input_handler,
    		input4_input_handler
    	];
    }

    class Person_form extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { personModal: 0, onUpdate: 5 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Person_form",
    			options,
    			id: create_fragment$1.name
    		});
    	}

    	get personModal() {
    		throw new Error("<Person_form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set personModal(value) {
    		throw new Error("<Person_form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onUpdate() {
    		throw new Error("<Person_form>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onUpdate(value) {
    		throw new Error("<Person_form>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/common/action-button.svelte generated by Svelte v3.31.0 */

    const file$2 = "src/components/common/action-button.svelte";

    function create_fragment$2(ctx) {
    	let button;
    	let i;
    	let i_class_value;
    	let button_class_value;
    	let current;
    	let mounted;
    	let dispose;
    	const default_slot_template = /*#slots*/ ctx[4].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[3], null);

    	const block = {
    		c: function create() {
    			button = element("button");
    			i = element("i");
    			if (default_slot) default_slot.c();
    			attr_dev(i, "class", i_class_value = "" + (null_to_empty("icofont-" + /*icon*/ ctx[1]) + " svelte-1pkeqz7"));
    			add_location(i, file$2, 20, 52, 367);
    			attr_dev(button, "class", button_class_value = "" + (null_to_empty("btn " + /*kind*/ ctx[0]) + " svelte-1pkeqz7"));
    			add_location(button, file$2, 20, 0, 315);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);
    			append_dev(button, i);

    			if (default_slot) {
    				default_slot.m(button, null);
    			}

    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*onClick*/ ctx[2]())) /*onClick*/ ctx[2]().apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (!current || dirty & /*icon*/ 2 && i_class_value !== (i_class_value = "" + (null_to_empty("icofont-" + /*icon*/ ctx[1]) + " svelte-1pkeqz7"))) {
    				attr_dev(i, "class", i_class_value);
    			}

    			if (default_slot) {
    				if (default_slot.p && dirty & /*$$scope*/ 8) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[3], dirty, null, null);
    				}
    			}

    			if (!current || dirty & /*kind*/ 1 && button_class_value !== (button_class_value = "" + (null_to_empty("btn " + /*kind*/ ctx[0]) + " svelte-1pkeqz7"))) {
    				attr_dev(button, "class", button_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			if (default_slot) default_slot.d(detaching);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Action_button", slots, ['default']);
    	let { kind = "success" } = $$props;
    	let { icon = "" } = $$props;

    	let { onClick = () => {
    		
    	} } = $$props;

    	const writable_props = ["kind", "icon", "onClick"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Action_button> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("kind" in $$props) $$invalidate(0, kind = $$props.kind);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
    		if ("$$scope" in $$props) $$invalidate(3, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ kind, icon, onClick });

    	$$self.$inject_state = $$props => {
    		if ("kind" in $$props) $$invalidate(0, kind = $$props.kind);
    		if ("icon" in $$props) $$invalidate(1, icon = $$props.icon);
    		if ("onClick" in $$props) $$invalidate(2, onClick = $$props.onClick);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [kind, icon, onClick, $$scope, slots];
    }

    class Action_button extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { kind: 0, icon: 1, onClick: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Action_button",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get kind() {
    		throw new Error("<Action_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set kind(value) {
    		throw new Error("<Action_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get icon() {
    		throw new Error("<Action_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set icon(value) {
    		throw new Error("<Action_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get onClick() {
    		throw new Error("<Action_button>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set onClick(value) {
    		throw new Error("<Action_button>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Persons/grid.svelte generated by Svelte v3.31.0 */
    const file$3 = "src/components/Persons/grid.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i].id;
    	child_ctx[6] = list[i].firstName;
    	child_ctx[7] = list[i].lastName;
    	child_ctx[8] = list[i].phone;
    	child_ctx[9] = list[i].provider;
    	child_ctx[10] = list[i].city;
    	child_ctx[11] = list[i].picture;
    	child_ctx[12] = list[i].visible;
    	child_ctx[14] = i;
    	return child_ctx;
    }

    // (30:8) {#if visible}
    function create_if_block$1(ctx) {
    	let div6;
    	let div0;
    	let t0_value = /*firstName*/ ctx[6] + "";
    	let t0;
    	let img;
    	let img_src_value;
    	let t1;
    	let div1;
    	let t2_value = /*lastName*/ ctx[7] + "";
    	let t2;
    	let t3;
    	let div2;
    	let t4_value = /*phone*/ ctx[8] + "";
    	let t4;
    	let t5;
    	let div3;
    	let t6_value = /*city*/ ctx[10] + "";
    	let t6;
    	let t7;
    	let div4;
    	let t8_value = /*provider*/ ctx[9] + "";
    	let t8;
    	let t9;
    	let div5;
    	let actionbutton0;
    	let t10;
    	let actionbutton1;
    	let t11;
    	let current;

    	function func() {
    		return /*func*/ ctx[3](/*id*/ ctx[5]);
    	}

    	actionbutton0 = new Action_button({
    			props: {
    				onClick: func,
    				icon: "eraser",
    				kind: "danger"
    			},
    			$$inline: true
    		});

    	function func_1() {
    		return /*func_1*/ ctx[4](/*id*/ ctx[5]);
    	}

    	actionbutton1 = new Action_button({
    			props: {
    				onClick: func_1,
    				icon: "edit-alt",
    				kind: "success"
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			t0 = text(t0_value);
    			img = element("img");
    			t1 = space();
    			div1 = element("div");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			t4 = text(t4_value);
    			t5 = space();
    			div3 = element("div");
    			t6 = text(t6_value);
    			t7 = space();
    			div4 = element("div");
    			t8 = text(t8_value);
    			t9 = space();
    			div5 = element("div");
    			create_component(actionbutton0.$$.fragment);
    			t10 = space();
    			create_component(actionbutton1.$$.fragment);
    			t11 = space();
    			if (img.src !== (img_src_value = "/images/avator.JPG")) attr_dev(img, "src", img_src_value);
    			add_location(img, file$3, 33, 31, 1072);
    			attr_dev(div0, "class", "col-2");
    			add_location(div0, file$3, 32, 16, 1021);
    			attr_dev(div1, "class", "col-2");
    			add_location(div1, file$3, 35, 16, 1144);
    			attr_dev(div2, "class", "col-2");
    			add_location(div2, file$3, 36, 16, 1196);
    			attr_dev(div3, "class", "col-2");
    			add_location(div3, file$3, 37, 16, 1245);
    			attr_dev(div4, "class", "col-2");
    			add_location(div4, file$3, 38, 16, 1293);
    			attr_dev(div5, "class", "col-2");
    			add_location(div5, file$3, 39, 16, 1345);
    			attr_dev(div6, "class", "row rowHead svelte-1r6n7bk");
    			add_location(div6, file$3, 30, 12, 917);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div0, t0);
    			append_dev(div0, img);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div1, t2);
    			append_dev(div6, t3);
    			append_dev(div6, div2);
    			append_dev(div2, t4);
    			append_dev(div6, t5);
    			append_dev(div6, div3);
    			append_dev(div3, t6);
    			append_dev(div6, t7);
    			append_dev(div6, div4);
    			append_dev(div4, t8);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			mount_component(actionbutton0, div5, null);
    			append_dev(div5, t10);
    			mount_component(actionbutton1, div5, null);
    			append_dev(div6, t11);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			if ((!current || dirty & /*Persons*/ 1) && t0_value !== (t0_value = /*firstName*/ ctx[6] + "")) set_data_dev(t0, t0_value);
    			if ((!current || dirty & /*Persons*/ 1) && t2_value !== (t2_value = /*lastName*/ ctx[7] + "")) set_data_dev(t2, t2_value);
    			if ((!current || dirty & /*Persons*/ 1) && t4_value !== (t4_value = /*phone*/ ctx[8] + "")) set_data_dev(t4, t4_value);
    			if ((!current || dirty & /*Persons*/ 1) && t6_value !== (t6_value = /*city*/ ctx[10] + "")) set_data_dev(t6, t6_value);
    			if ((!current || dirty & /*Persons*/ 1) && t8_value !== (t8_value = /*provider*/ ctx[9] + "")) set_data_dev(t8, t8_value);
    			const actionbutton0_changes = {};
    			if (dirty & /*hdlDelete, Persons*/ 3) actionbutton0_changes.onClick = func;
    			actionbutton0.$set(actionbutton0_changes);
    			const actionbutton1_changes = {};
    			if (dirty & /*hdlEdit, Persons*/ 5) actionbutton1_changes.onClick = func_1;
    			actionbutton1.$set(actionbutton1_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(actionbutton0.$$.fragment, local);
    			transition_in(actionbutton1.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(actionbutton0.$$.fragment, local);
    			transition_out(actionbutton1.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(actionbutton0);
    			destroy_component(actionbutton1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(30:8) {#if visible}",
    		ctx
    	});

    	return block;
    }

    // (29:4) {#each Persons as { id, firstName, lastName, phone, provider, city, picture, visible }
    function create_each_block(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*visible*/ ctx[12] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (/*visible*/ ctx[12]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*Persons*/ 1) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(29:4) {#each Persons as { id, firstName, lastName, phone, provider, city, picture, visible }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div7;
    	let div6;
    	let div0;
    	let t1;
    	let div1;
    	let t3;
    	let div2;
    	let t5;
    	let div3;
    	let t7;
    	let div4;
    	let t9;
    	let div5;
    	let t11;
    	let current;
    	let each_value = /*Persons*/ ctx[0];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div6 = element("div");
    			div0 = element("div");
    			div0.textContent = "نام";
    			t1 = space();
    			div1 = element("div");
    			div1.textContent = "نام خانوادگی";
    			t3 = space();
    			div2 = element("div");
    			div2.textContent = "شماره تلفن";
    			t5 = space();
    			div3 = element("div");
    			div3.textContent = "تامین کننده";
    			t7 = space();
    			div4 = element("div");
    			div4.textContent = "شهر";
    			t9 = space();
    			div5 = element("div");
    			div5.textContent = "عملیات";
    			t11 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			attr_dev(div0, "class", "col-2");
    			add_location(div0, file$3, 21, 8, 536);
    			attr_dev(div1, "class", "col-2");
    			add_location(div1, file$3, 22, 8, 573);
    			attr_dev(div2, "class", "col-2");
    			add_location(div2, file$3, 23, 8, 619);
    			attr_dev(div3, "class", "col-2");
    			add_location(div3, file$3, 24, 8, 663);
    			attr_dev(div4, "class", "col-2");
    			add_location(div4, file$3, 25, 8, 708);
    			attr_dev(div5, "class", "col-2");
    			add_location(div5, file$3, 26, 8, 745);
    			attr_dev(div6, "class", "row svelte-1r6n7bk");
    			attr_dev(div6, "style", "margin-bottom : 20px ");
    			add_location(div6, file$3, 20, 4, 480);
    			attr_dev(div7, "class", "container");
    			add_location(div7, file$3, 19, 0, 452);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div6);
    			append_dev(div6, div0);
    			append_dev(div6, t1);
    			append_dev(div6, div1);
    			append_dev(div6, t3);
    			append_dev(div6, div2);
    			append_dev(div6, t5);
    			append_dev(div6, div3);
    			append_dev(div6, t7);
    			append_dev(div6, div4);
    			append_dev(div6, t9);
    			append_dev(div6, div5);
    			append_dev(div7, t11);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div7, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*hdlEdit, Persons, hdlDelete*/ 7) {
    				each_value = /*Persons*/ ctx[0];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div7, null);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			destroy_each(each_blocks, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Grid", slots, []);
    	let { Persons = {} } = $$props;

    	let { hdlDelete = () => {
    		
    	} } = $$props;

    	let { hdlEdit = () => {
    		
    	} } = $$props;

    	const writable_props = ["Persons", "hdlDelete", "hdlEdit"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Grid> was created with unknown prop '${key}'`);
    	});

    	const func = id => {
    		hdlDelete(id);
    	};

    	const func_1 = id => {
    		hdlEdit(id);
    	};

    	$$self.$$set = $$props => {
    		if ("Persons" in $$props) $$invalidate(0, Persons = $$props.Persons);
    		if ("hdlDelete" in $$props) $$invalidate(1, hdlDelete = $$props.hdlDelete);
    		if ("hdlEdit" in $$props) $$invalidate(2, hdlEdit = $$props.hdlEdit);
    	};

    	$$self.$capture_state = () => ({
    		ActionButton: Action_button,
    		Persons,
    		hdlDelete,
    		hdlEdit
    	});

    	$$self.$inject_state = $$props => {
    		if ("Persons" in $$props) $$invalidate(0, Persons = $$props.Persons);
    		if ("hdlDelete" in $$props) $$invalidate(1, hdlDelete = $$props.hdlDelete);
    		if ("hdlEdit" in $$props) $$invalidate(2, hdlEdit = $$props.hdlEdit);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [Persons, hdlDelete, hdlEdit, func, func_1];
    }

    class Grid extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { Persons: 0, hdlDelete: 1, hdlEdit: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Grid",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get Persons() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Persons(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hdlDelete() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hdlDelete(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hdlEdit() {
    		throw new Error("<Grid>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hdlEdit(value) {
    		throw new Error("<Grid>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const PersonsData = writable([
        {
            id: 0,
            firstName: "مهرداد",
            lastName: "نوروزمکاری",
            phone: "09177043608",
            provider: "پتروشیمی",
            city: "شیراز",
            picture: "./avator.png",
            visible:true
        },
        {
            id: 1,
            firstName: "ایمان",
            lastName: "مردانی",
            phone: "091208043605",
            provider: "پارس جنوبی",
            city: "عسلویه",
            picture: "./avator.png",
            visible:true
        },
        {
            id: 2,
            firstName: "حسن",
            lastName: "محمدی",
            phone: "09177043608",
            provider: "صنعت شمال",
            city: "ساری",
            picture: "./avator.png",
            visible:true
        },
        {
            id: 3,
            firstName: "جواد",
            lastName: "زارع",
            phone: "09177043608",
            provider: "پتروشیمی خوزستان",
            city: "خوزستان",
            picture: "./avator.png",
            visible:true
        },
        {
            id: 4,
            firstName: "محمد",
            lastName: "شبرنگ",
            phone: "09177043608",
            provider: " خوزستان",
            city: "خوزستان",
            picture: "./avator.png",
            visible:true
        },
    ]);

    /* src/components/Persons/new-person.svelte generated by Svelte v3.31.0 */

    const file$4 = "src/components/Persons/new-person.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let button;
    	let t;
    	let i;
    	let i_style_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			button = element("button");
    			t = text("اضافه کردن\n        ");
    			i = element("i");
    			attr_dev(i, "class", "icofont-ui-add");
    			attr_dev(i, "style", i_style_value = "color:white;");
    			add_location(i, file$4, 29, 8, 601);
    			attr_dev(button, "class", "btnNew  svelte-53z9gv");
    			add_location(button, file$4, 27, 4, 515);
    			attr_dev(div, "class", "btnContainer svelte-53z9gv");
    			add_location(div, file$4, 25, 0, 483);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, button);
    			append_dev(button, t);
    			append_dev(button, i);

    			if (!mounted) {
    				dispose = listen_dev(
    					button,
    					"click",
    					function () {
    						if (is_function(/*hdlNew*/ ctx[1]({ personsNew: /*personsNew*/ ctx[0] }))) /*hdlNew*/ ctx[1]({ personsNew: /*personsNew*/ ctx[0] }).apply(this, arguments);
    					},
    					false,
    					false,
    					false
    				);

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("New_person", slots, []);
    	let { personsNew } = $$props;

    	let { hdlNew = () => {
    		
    	} } = $$props;

    	const writable_props = ["personsNew", "hdlNew"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<New_person> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("personsNew" in $$props) $$invalidate(0, personsNew = $$props.personsNew);
    		if ("hdlNew" in $$props) $$invalidate(1, hdlNew = $$props.hdlNew);
    	};

    	$$self.$capture_state = () => ({ personsNew, hdlNew });

    	$$self.$inject_state = $$props => {
    		if ("personsNew" in $$props) $$invalidate(0, personsNew = $$props.personsNew);
    		if ("hdlNew" in $$props) $$invalidate(1, hdlNew = $$props.hdlNew);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [personsNew, hdlNew];
    }

    class New_person extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { personsNew: 0, hdlNew: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "New_person",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*personsNew*/ ctx[0] === undefined && !("personsNew" in props)) {
    			console.warn("<New_person> was created without expected prop 'personsNew'");
    		}
    	}

    	get personsNew() {
    		throw new Error("<New_person>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set personsNew(value) {
    		throw new Error("<New_person>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get hdlNew() {
    		throw new Error("<New_person>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set hdlNew(value) {
    		throw new Error("<New_person>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/common/search-bar.svelte generated by Svelte v3.31.0 */

    const file$5 = "src/components/common/search-bar.svelte";

    function create_fragment$5(ctx) {
    	let div;
    	let i;
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			i = element("i");
    			t = space();
    			input = element("input");
    			attr_dev(i, "class", "icofont-filter svelte-xzghdw");
    			add_location(i, file$5, 31, 4, 629);
    			attr_dev(input, "placeholder", "فیلترینگ");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "class", "svelte-xzghdw");
    			add_location(input, file$5, 32, 4, 662);
    			attr_dev(div, "class", "searchBarContainer svelte-xzghdw");
    			add_location(div, file$5, 30, 0, 592);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, i);
    			append_dev(div, t);
    			append_dev(div, input);
    			set_input_value(input, /*textSearch*/ ctx[0]);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[2]),
    					listen_dev(
    						input,
    						"keyup",
    						function () {
    							if (is_function(/*Searching*/ ctx[1](/*textSearch*/ ctx[0]))) /*Searching*/ ctx[1](/*textSearch*/ ctx[0]).apply(this, arguments);
    						},
    						false,
    						false,
    						false
    					)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (dirty & /*textSearch*/ 1 && input.value !== /*textSearch*/ ctx[0]) {
    				set_input_value(input, /*textSearch*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Search_bar", slots, []);
    	let { textSearch = "" } = $$props;

    	let { Searching = e => {
    		
    	} } = $$props;

    	const writable_props = ["textSearch", "Searching"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Search_bar> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		textSearch = this.value;
    		$$invalidate(0, textSearch);
    	}

    	$$self.$$set = $$props => {
    		if ("textSearch" in $$props) $$invalidate(0, textSearch = $$props.textSearch);
    		if ("Searching" in $$props) $$invalidate(1, Searching = $$props.Searching);
    	};

    	$$self.$capture_state = () => ({ textSearch, Searching });

    	$$self.$inject_state = $$props => {
    		if ("textSearch" in $$props) $$invalidate(0, textSearch = $$props.textSearch);
    		if ("Searching" in $$props) $$invalidate(1, Searching = $$props.Searching);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [textSearch, Searching, input_input_handler];
    }

    class Search_bar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { textSearch: 0, Searching: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Search_bar",
    			options,
    			id: create_fragment$5.name
    		});
    	}

    	get textSearch() {
    		throw new Error("<Search_bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set textSearch(value) {
    		throw new Error("<Search_bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get Searching() {
    		throw new Error("<Search_bar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set Searching(value) {
    		throw new Error("<Search_bar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/components/Persons/persons.svelte generated by Svelte v3.31.0 */

    const { console: console_1$1 } = globals;
    const file$6 = "src/components/Persons/persons.svelte";

    function create_fragment$6(ctx) {
    	let newperson;
    	let t0;
    	let br0;
    	let t1;
    	let searchbar;
    	let t2;
    	let br1;
    	let t3;
    	let grid;
    	let current;

    	newperson = new New_person({
    			props: {
    				personsNew: /*personsData*/ ctx[0],
    				hdlNew: /*hdlNewPerson*/ ctx[2]
    			},
    			$$inline: true
    		});

    	searchbar = new Search_bar({
    			props: { Searching: /*searchin*/ ctx[4] },
    			$$inline: true
    		});

    	grid = new Grid({
    			props: {
    				Persons: /*personsData*/ ctx[0],
    				hdlDelete: /*handelDeletePerson*/ ctx[3],
    				hdlEdit: /*editPerson*/ ctx[1]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(newperson.$$.fragment);
    			t0 = space();
    			br0 = element("br");
    			t1 = space();
    			create_component(searchbar.$$.fragment);
    			t2 = space();
    			br1 = element("br");
    			t3 = space();
    			create_component(grid.$$.fragment);
    			add_location(br0, file$6, 86, 0, 2436);
    			add_location(br1, file$6, 88, 0, 2476);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			mount_component(newperson, target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, br0, anchor);
    			insert_dev(target, t1, anchor);
    			mount_component(searchbar, target, anchor);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, br1, anchor);
    			insert_dev(target, t3, anchor);
    			mount_component(grid, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const newperson_changes = {};
    			if (dirty & /*personsData*/ 1) newperson_changes.personsNew = /*personsData*/ ctx[0];
    			newperson.$set(newperson_changes);
    			const grid_changes = {};
    			if (dirty & /*personsData*/ 1) grid_changes.Persons = /*personsData*/ ctx[0];
    			grid.$set(grid_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(newperson.$$.fragment, local);
    			transition_in(searchbar.$$.fragment, local);
    			transition_in(grid.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(newperson.$$.fragment, local);
    			transition_out(searchbar.$$.fragment, local);
    			transition_out(grid.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(newperson, detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(br0);
    			if (detaching) detach_dev(t1);
    			destroy_component(searchbar, detaching);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(br1);
    			if (detaching) detach_dev(t3);
    			destroy_component(grid, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Persons", slots, []);
    	const { open } = getContext("simple-modal");
    	let personsData;

    	const unsubscribe = PersonsData.subscribe(value => {
    		$$invalidate(0, personsData = value);
    	});

    	let newPersonData = () => {
    		return {
    			id: -1,
    			firstName: "",
    			lastName: "",
    			phone: "",
    			provider: "",
    			city: "",
    			picture: "",
    			visible: true
    		};
    	};

    	let updatePerson = person => {
    		const persons = [...personsData];

    		if (person.id === -1) {
    			let maxID = 0;
    			personsData.forEach(p => maxID = p.id > maxID ? p.id : maxID);
    			person.id = maxID + 1;
    			persons.push(person);
    			$$invalidate(0, personsData = persons);
    			return;
    		}

    		for (var i = 0; i < persons.length; i++) {
    			if (persons[i].id === person.id) {
    				persons[i] = person;
    			}
    		}

    		$$invalidate(0, personsData = persons);
    	};

    	let getPersonByid = id => {
    		let person = personsData.filter(p => p.id === id);
    		return person[0];
    	};

    	let editPerson = id => {
    		open(
    			Person_form,
    			{
    				personModal: getPersonByid(id),
    				onUpdate: updatePerson
    			},
    			{ transitionWindow: fly }
    		);
    	};

    	let hdlNewPerson = id => {
    		open(
    			Person_form,
    			{
    				personModal: newPersonData(),
    				onUpdate: updatePerson
    			},
    			{ transitionWindow: fly }
    		);
    	};

    	let handelDeletePerson = id => {
    		const persons = [...personsData];
    		let filtredPersons = persons.filter(p => p.id !== id);
    		console.log(id);
    		$$invalidate(0, personsData = filtredPersons);
    	};

    	let searchin = textSearch => {
    		const persons = [...personsData];

    		for (var i = 0; i < persons.length; i++) {
    			let js = JSON.stringify(persons[i]);

    			if (js.includes(textSearch)) {
    				persons[i].visible = true;
    			} else {
    				persons[i].visible = false;
    			}
    		}

    		$$invalidate(0, personsData = persons);
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Persons> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		getContext,
    		hasContext,
    		setContext,
    		personForm: Person_form,
    		fly,
    		Grid,
    		PersonsData,
    		NewPerson: New_person,
    		SearchBar: Search_bar,
    		open,
    		personsData,
    		unsubscribe,
    		newPersonData,
    		updatePerson,
    		getPersonByid,
    		editPerson,
    		hdlNewPerson,
    		handelDeletePerson,
    		searchin
    	});

    	$$self.$inject_state = $$props => {
    		if ("personsData" in $$props) $$invalidate(0, personsData = $$props.personsData);
    		if ("newPersonData" in $$props) newPersonData = $$props.newPersonData;
    		if ("updatePerson" in $$props) updatePerson = $$props.updatePerson;
    		if ("getPersonByid" in $$props) getPersonByid = $$props.getPersonByid;
    		if ("editPerson" in $$props) $$invalidate(1, editPerson = $$props.editPerson);
    		if ("hdlNewPerson" in $$props) $$invalidate(2, hdlNewPerson = $$props.hdlNewPerson);
    		if ("handelDeletePerson" in $$props) $$invalidate(3, handelDeletePerson = $$props.handelDeletePerson);
    		if ("searchin" in $$props) $$invalidate(4, searchin = $$props.searchin);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [personsData, editPerson, hdlNewPerson, handelDeletePerson, searchin];
    }

    class Persons extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Persons",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.31.0 */
    const file$7 = "src/App.svelte";

    // (8:1) <Modal>
    function create_default_slot(ctx) {
    	let persons;
    	let current;
    	persons = new Persons({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(persons.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(persons, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(persons.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(persons.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(persons, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(8:1) <Modal>",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let main;
    	let modal;
    	let current;

    	modal = new Modal({
    			props: {
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			main = element("main");
    			create_component(modal.$$.fragment);
    			attr_dev(main, "class", "svelte-1e849j6");
    			add_location(main, file$7, 6, 0, 137);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			mount_component(modal, main, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const modal_changes = {};

    			if (dirty & /*$$scope*/ 1) {
    				modal_changes.$$scope = { dirty, ctx };
    			}

    			modal.$set(modal_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(modal.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(modal.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			destroy_component(modal);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Modal, Persons });
    	return [];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment$7.name
    		});
    	}
    }

    const app = new App({
    	target: document.body,
    	props: {
    	//	name: 'مهرداد'
    	}
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
