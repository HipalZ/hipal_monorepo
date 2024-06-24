import styles from "./cool.module.css";

const LoaderComponent = () => {
	return (
		<div>
			<div id={styles.cooking}>
				{[...Array(5)].map((_, i) => (
					<div
						key={i+1}
						className={styles.bubble + " " + styles["bubble-" + (i + 1)]}
					/>
				))}
				<div id={styles.area}>
					<div id={styles.sides}>
						<div id={styles.pan} />
						<div id={styles.handle} />
					</div>
					<div id={styles.pancake}>
						<div id={styles.pastry} />
					</div>
				</div>
			</div>
			<h1 className={styles.h1}>Creating Kot...</h1>
		</div>
	);
};

export default LoaderComponent;
