/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type {JSX} from 'react';

import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import styles from './styles.module.css';

type Props = {
  className?: string;
  placeholderClassName?: string;
  placeholder: string;
};

export default function LexicalContentEditable({
  className,
  placeholder,
  placeholderClassName,
}: Props): JSX.Element {
  return (
    <ContentEditable
      className={className ?? styles.root}
      aria-placeholder={placeholder}
      placeholder={
        <div className={placeholderClassName ?? styles.placeholder}>
          {placeholder}
        </div>
      }
    />
  );
}
