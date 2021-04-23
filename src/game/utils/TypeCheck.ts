// (simply because why not? more types to god of types) @Felix

/**
 * If the object implemented ITypeName, you then can use IsObjectOfType on it.
 * You can specify multiple types in the string with "|" separator, e.g.: "GameButton | GUIContainer"
 */
export interface IHasType {
    readonly TYPE_NAME: string;
}

export const TYPE_STRING_SPLITTER = ",";

/**
 * @param obj If the object implemented ITypeName interface, it will check it's TYPE_NAME property
 * @param type
 * @param returnIfHasNoType
 * @param throwErrorIfHasNoType
 */
export function IsObjectOfType(obj: any | IHasType, type: string, returnIfHasNoType: any = false, throwErrorIfHasNoType = false): boolean {
    if (typeof obj == "object" && "TYPE_NAME" in obj && (typeof (<any>obj).TYPE_NAME == "string")) {
        let typed = obj as { TYPE_NAME: string };

        type = type.replaceAll(' ', '');
        typed.TYPE_NAME = typed.TYPE_NAME.replaceAll(' ', '');

        if (typed.TYPE_NAME.includes(TYPE_STRING_SPLITTER)) {
            let objTypes = typed.TYPE_NAME.split(TYPE_STRING_SPLITTER)

            return objTypes.find(typeName => IsSingleTypeInString(type, typeName)) != undefined;
        }
        else {
            return typed.TYPE_NAME == type;
        }
    }
    else {
        if (throwErrorIfHasNoType) throw new Error(`Object has no type`);
        return returnIfHasNoType;
    }
}

function IsSingleTypeInString(str: string, singleType: string) {
    if (singleType.includes(TYPE_STRING_SPLITTER)) throw new Error(`Type '${singleType}' is not a single type`);

    if (str.includes(TYPE_STRING_SPLITTER)) {
        let objTypes = str.split(TYPE_STRING_SPLITTER)
        return objTypes.find(typeName => typeName == singleType) != undefined;
    }
    else {
        return str == singleType;
    }
}