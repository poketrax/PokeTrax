
<div class="relative">
    <div class="wrapper">
        <div class="pokeball" />
    </div>
</div>


<style lang="css">
    .wrapper {
        box-sizing: border-box;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }

    .pokeball {
        box-sizing: border-box;
        height: 60px;
        width: 60px;
        background-color: #fff;
        border-radius: 50%;
        position: relative;
        overflow: hidden;
        border: 3px solid;
        animation: frames 0.8s linear 0s infinite;
    }

    .pokeball:after {
        content: "";
        position: absolute;
        width: 60px;
        height: 30px;
        background-color: red;
        border-bottom: 4px solid;
        top: -4px;
    }

    .pokeball:before {
        content: "";
        position: absolute;
        background-color: #fff;
        width: 20px;
        height: 20px;
        border: 4px solid;
        border-radius: 50%;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        z-index: 1;
    }

    /* AnimationFrames */
    @keyframes frames {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
</style>
