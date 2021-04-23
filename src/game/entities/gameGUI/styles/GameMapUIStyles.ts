import { ButtonConfig, TextConfig } from "../../../gui/button/GameButton";

export namespace GUIStyles {
    import Color = Phaser.Display.Color;
    import Size = Phaser.Structs.Size;
    import TextStyle = Phaser.Types.GameObjects.Text.TextStyle;
    import TextShadow = Phaser.Types.GameObjects.Text.TextShadow;

    export namespace GameMenu {
        export const Title: TextStyle  = {
            shadow: <TextShadow> {
                fill: true,
                offsetX: 1,
                offsetY: 1,
                color: "rgba(0,0,0,0.76)",
                blur: 1,
            },
            fontSize: "42px",
            fontFamily: "Regular"
        }
    }

    export namespace Game {
        export const GeneralText = {
            Shadow: <TextShadow> {
                fill: true,
                offsetX: 1,
                offsetY: 1,
                color: "rgba(0,0,0,0.76)",
                blur: 1,
            }
        };

        export const WalletText = <TextStyle>{
            fontFamily: "Regular", fontSize: "40px", shadow: GeneralText.Shadow,
            fixedHeight: 64
        };

        //todo split to separate sub-namespace?
        export const UpgradeInfo = {
            Back: {
                color: Color.HexStringToColor("#3e3e3e"),
                alpha: 0.8,
            },

            TitleText: <TextStyle>{
                fontFamily: "Bold", fontSize: "36px",/* shadow: GeneralText.Shadow,*/
                align: "center"
            },

            InfoText: <TextStyle>{
                fontFamily: "Regular", fontSize: "30px", /*shadow: GeneralText.Shadow,*/
                align: "center"
            },
        };

        export const MenuButton = {
            DefaultSize: new Size(120, 34),
            Button: <ButtonConfig>{
                alpha: 1,
                color: Color.HexStringToColor("#65cbe3"),
                disabledColor: Color.HexStringToColor("#b36262"),

                onMouseOverColor: Color.HexStringToColor("#89e6ff"),
                onMouseOverAlpha: 1,

                borderWidth: 2,
            },
            Text: <TextConfig>{
                size: 36,
                color: Color.HexStringToColor("#fff"),
                font: "Regular",
            }
        };

        export const UpgradeButton = {
            DefaultSize: new Size(200, 60),
            Button: <ButtonConfig>{
                alpha: 1,
                color: Color.HexStringToColor("#2db63e"),

                onMouseOverColor: Color.HexStringToColor("#94ffa2"),
                onMouseOverAlpha: 1,
            },
            Text: <TextConfig>{
                size: 36,
                color: Color.HexStringToColor("#fff"),
                font: "Regular",
            }
        };
    }
}