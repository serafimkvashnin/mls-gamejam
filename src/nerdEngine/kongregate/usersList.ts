import {User} from "./user";

export enum SortUserMethod {
    Ascending = 'Ascending',
    Descending = 'Descending'
}

export class UserList {
    private readonly users: User[];
    constructor(users: User[]) {
        this.users = users;
    }

    GetUser(name: string): User {
        for (const user of this.users) {
            if (user.name === name) {
                return user;
            }
        }

        throw new Error(`User not found: ${name}`);
    }


    GetAll(): User[] {
        return this.users;
    }

    IsUserExists(name: string): boolean {
        for (const user of this.users) {
            if (user.name === name) {
                return true;
            }
        }

        return false;
    }

    AddRange(users: User[], replace: boolean = true) {
        for (const user of users) {
            this.Add(user, replace);
        }
    }

    Add(user: User, update: boolean = true, replace: boolean = false): void {
        if (this.IsUserExists(user.name)) {
            if (replace) {
                this.Remove(user.name);
                //console.log(`User removed: ${user.name}`);
                this.users.push(user);
            }
            else if (update) {
                const currentUser = this.GetUser(user.name);
                currentUser.AddKongStats(user.kongStats);
            }
            else {
                throw new Error(`User is already exists: ${user.name}`);
            }
        }
        else {
            this.users.push(user);
        }
    }

    Remove(name: string): void {
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].name == name) {
                this.users.splice(i, 1);
                return;
            }
        }

        throw new Error(`User not found: ${name}`);
    }
}