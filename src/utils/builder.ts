import type {
  AnyMessageContent,
  AnyRegularMessageContent,
} from '@adiwajshing/baileys';
import type {
  ButtonOptions,
  ButtonType,
  UnionToIntersection,
} from '../@typings';

/**
 * @class ButtonBuilder
 */
export class ButtonBuilder<T extends ButtonType> {
  protected buttons: Map<
    keyof UnionToIntersection<AnyRegularMessageContent>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    any
  > = new Map();

  /**
   * @constructor
   * @param {T} type type of button
   */
  constructor(public type: T) {
    switch (type) {
      case 'template':
        this.buttons.set('viewOnce', true);
        break;
    }
  }

  /**
   * Set button attributes
   * @param {K} key key of button attributes
   * @param {UnionToIntersection<ButtonOptions>} value value of button attributes based from the key
   * @return {ButtonBuilder}
   */
  set<K extends keyof UnionToIntersection<ButtonOptions>>(
    key: K,
    value: UnionToIntersection<ButtonOptions>[K],
  ): ButtonBuilder<T> {
    switch (key) {
      case 'footer':
        this.buttons.set('footer', value);
        break;
      case 'header':
        this.buttons.set('text', value);
        break;
    }

    if (this.type === 'basic' && typeof value === 'object' && 'text' in value) {
      const button = {
        buttonText: {
          displayText: value?.text,
        },
        buttonId: value.cmdName,
        type: 1,
      };

      if (this.buttons.has('buttons')) {
        const buttons = this.buttons.get('buttons');
        buttons.push(button);
      } else this.buttons.set('buttons', [button]);
    } else if (this.type === 'list') {
      switch (key) {
        case 'highlightText':
          this.buttons.set('title', value);
          break;
        case 'buttonText':
          this.buttons.set('buttonText', value);
          break;
        case 'sections':
          if (typeof value === 'object' && 'title' in value) {
            if (this.buttons.has('sections')) {
              const sections = this.buttons.get('sections');
              sections.push({
                title: value.title,
                rows: value.buttons,
              });
            } else
              this.buttons.set('sections', [
                {
                  title: value.title,
                  rows: value.buttons.map((button) => ({
                    title: button.text,
                    description: button.description,
                    rowId: button.cmdName,
                  })),
                },
              ]);
          }
          break;
      }
    } else if (this.type === 'template' && typeof value === 'object') {
      if ('text' in value) {
        if (this.buttons.has('templateButtons')) {
          const buttons = this.buttons.get('templateButtons');
          buttons.push({
            quickReplyButton: {
              displayText: value.text,
              id: value.cmdName,
            },
          });
        } else
          this.buttons.set('templateButtons', [
            {
              quickReplyButton: {
                displayText: value.text,
                id: value.cmdName,
              },
            },
          ]);
      }
    }
    return this;
  }

  /**
   * Build button structures
   * @return {AnyMessageContent}
   */
  build() {
    return Object.fromEntries(this.buttons) as AnyMessageContent;
  }
}
