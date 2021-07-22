import React from 'react';
import clsx from 'clsx';
import styles from './Form.css';

export const Container = ({style, children, inline}) => {
  const className = {[styles.containerInline]: inline};
  return (
    <div style={style} className={clsx(styles.container, className)}>
      {children}
    </div>
  );
};

export const FormLabel = ({
  contentClassName,
  style,
  label,
  children,
  inline,
}) => {
  const className = {[styles.formInline]: inline};
  return (
    <div className={clsx(styles.form, className)} style={style}>
      <div className={styles.label}>{label}</div>
      <div className={clsx(styles.content, contentClassName)}>{children}</div>
    </div>
  );
};
