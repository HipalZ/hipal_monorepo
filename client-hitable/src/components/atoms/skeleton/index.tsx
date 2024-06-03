import React from 'react'
import styles from './skeloton.module.css'
function Skeleton() {
  return (
    <div className={styles.skeleton}>
    <div className={styles.back_button} />
    <div className={styles.heading} />
    <div className={styles.full_width_button} />
      <div className={styles.cards}>
      <div className={styles.card} />
      <div className={styles.card} />
      <div className={styles.card} />
    </div>
  </div>
  )
}

export default Skeleton