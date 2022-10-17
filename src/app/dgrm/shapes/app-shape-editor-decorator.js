import { SvgShapeTextEditorDecorator } from '../../../diagram-extensions/text-editor/svg-shape-texteditor-decorator.js';
import { ShapeSettings } from '../elements/shape-settigns.js';
import { pnlCreate, pnlDel, pnlMove, pnlSymbol } from '../panel-create.js';

/** @implements {IAppShape} */
export class AppShapeEditorDecorator extends SvgShapeTextEditorDecorator {
	/**
	 * @param {IDiagram} diagram
	 * @param {ISvgPresenterShape} svgShape
	 * @param {IAppShapeData} addParam
	 */
	constructor(diagram, svgShape, addParam) {
		super(
			svgShape,

			// SvgShapeTextEditorDecorator is common class. It use universal description for texteditors
			// { text: { textContent: addParam.detail } }

			// TODO: here pass null, because shapefactory call update() right after creation of the shape.
			// don't remeber why shapefactory do so
			null);

		/** @private */
		this._templateKey = addParam.templateKey;
		this.diagram = diagram;
	}

	/**
	 * @param {IAppShapeData & DiagramShapeUpdateParam} param
	 */
	update(param) {
		if (param.detail) {
			if (!param.props) { param.props = {}; }
			Object.assign(param.props, { text: { textContent: param.detail } });
		}
		const oldText = this.txtProps.text?.textContent;
		super.update(param);

		if (oldText !== this.txtProps.text?.textContent) {
			// notify inheritors
			// TODO: maybe move this to SvgShapeTextEditorDecorator
			this.onTextChange(this.svgEl.querySelector('[data-key="text"]'), null);
		}
	}

	/**
	 * when shape enter edit mode
	 * override this method
	 * @param {PointerEvent & { target: SVGGraphicsElement }} evt
	 */
	onEdit(evt) {
		this.svgEl.classList.add('highlighted');
		this._panelShow();
	}

	/**
	 * when shape leave edit mode
	 * override this method
	 */
	onEditLeave() {
		super.onEditLeave();
		this.svgEl.classList.remove('highlighted');
		pnlDel(this);
	}

	/** @private */
	_panelShow() {
		const shapeSettings = new ShapeSettings();
		shapeSettings.addEventListener('cmd', /** @param {CustomEvent} evt */ evt => {
			switch (evt.detail.cmd) {
				case 'del':
					pnlDel(this);
					this.diagram.del(this);
					break;
				// case 'color':
				// 	this.diagram.shapeUpdate(this, {
				// 		props: { main: { fill: arg, stroke: arg } }
				// 	});
				//	break;
			}
		});

		pnlCreate(this, 0, 0, shapeSettings);
		this.panelUpdPos();
	}

	/** update panel position */
	panelUpdPos() {
		if (this[pnlSymbol]) {
			const position = this.svgEl.getBoundingClientRect();
			pnlMove(this, position.left + 10, position.top + 10);
		}
	}

	/** @return {IAppShapeData} */
	toJson() {
		const position = this.positionGet();
		position.x = Math.trunc(position.x);
		position.y = Math.trunc(position.y);

		return {
			templateKey: this._templateKey,
			position,
			detail: /** @type {string} */(this.txtProps.text?.textContent)
		};
	}
}