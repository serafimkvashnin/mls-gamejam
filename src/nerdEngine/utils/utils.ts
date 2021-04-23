import fileDownload from "js-file-download";

//todo try to implement (because chrome doesn't ask for file name, it's stupid)
export function DownloadFile(fileName: string, data: string) {
    fileDownload(data, fileName);
}