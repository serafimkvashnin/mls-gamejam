export class UserImage {
    //example: https://cdn1.kongcdn.com/assets/avatars/defaults/bird.png?i10c=img.resize(width:28)
    private readonly url: string;
    constructor(url: string) {
        this.url = url;
    }

    GetURL(size: number = 28) {
        return this.url.replace('width:28', `width:${size}`);
    }
}