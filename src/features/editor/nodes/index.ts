import { LayoutContainerNode } from './LayoutContainerNode';
import {Klass, LexicalNode} from "lexical";
import {HeadingNode, QuoteNode} from "@lexical/rich-text";
import {ListItemNode, ListNode} from "@lexical/list";
import {CodeHighlightNode, CodeNode} from "@lexical/code";
import {TableCellNode, TableNode, TableRowNode} from "@lexical/table";
import {AutoLinkNode, LinkNode} from "@lexical/link";
import {HorizontalRuleNode} from "@lexical/react/LexicalHorizontalRuleNode";
import { StickyNode } from "./StickyNode";
import { ImageNode } from "./ImageNode";
import { EquationNode } from "./EquationNode";
import { LayoutItemNode } from './LayoutItemNode';
import { MarkNode } from '@lexical/mark';



const nodes: Array<Klass<LexicalNode>> = [
  HeadingNode,
  ListNode,
  ListItemNode,
  QuoteNode,
  CodeNode,
  TableNode,
  TableCellNode,
  TableRowNode,
  CodeHighlightNode,
  AutoLinkNode,
  LinkNode,
  HorizontalRuleNode,
  ImageNode,
  StickyNode,
  TableNode,
  EquationNode,
  LayoutContainerNode,
  LayoutItemNode,
  MarkNode
]
export default nodes;