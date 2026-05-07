<script>
export default {
	onLaunch() {
		console.log('Companion App Launch')
	},
	onShow() {
		console.log('Companion App Show')
	},
	onHide() {
		console.log('Companion App Hide')
	}
}
</script>

<style>
page {
	background: #f6faf8;
	color: #22313f;
	font-size: 28rpx;
}

view,
text,
button {
	box-sizing: border-box;
}

button::after {
	border: none;
}
</style>
