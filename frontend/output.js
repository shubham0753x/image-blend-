const result_image =
    document.getElementById("result_image");

const download_btn =
    document.getElementById("download_btn");

    download_btn.addEventListener("click", () => {

    const link = document.createElement("a");

    link.href = result_image.src;
    link.download = "blended_image.png";

    link.click();
});