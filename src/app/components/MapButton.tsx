/**
 * @file src/app/components/MapButton.tsx
 * @description MapButton component.
 * @author Tom Planche
 */

// IMPORTS ===================================================================================================  IMPORTS
import {
  Animated,
  GestureResponderEvent,
  PressableProps,
  StyleProp,
  TextStyle,
  TouchableOpacity,
  ViewStyle
} from "react-native";
import {FontAwesome5} from "@expo/vector-icons";
import { Text, TextProps } from "./Text"
import {colors, spacing} from "../theme";
import {ComponentType, forwardRef, RefObject} from "react";
import {ButtonAccessoryProps} from "./Button";
// END IMPORTS ==========================================================================================   END IMPORTS

// VARIABLES ================================================================================================ VARIABLE
export interface MapButtonProps extends PressableProps {
  /**
   * Called when the touch is released,
   * but not if cancelled (e.g. by a scroll that steals the responder lock).
   */
  onPress?: ((event: GestureResponderEvent) => void) | undefined;

  onPressIn?: ((event: GestureResponderEvent) => void) | undefined;

  onPressOut?: ((event: GestureResponderEvent) => void) | undefined;

  icon?: string;
  iconSize?: number;
  iconColor?: string;

  /**
   * An optional style override useful for padding & margin.
   */
  style?: StyleProp<ViewStyle>
}
// END VARIABLES ======================================================================================= END VARIABLES

// COMPONENENT  ============================================================================================= COMPONENT

/**
 * MapButton component
 * @return
 * @constructor
 **/
const MapButton = forwardRef((props: MapButtonProps, ref) => {
  // Props
  const {
    onPressIn,
    onPressOut,
    onPress,

    icon,
    iconSize,
    iconColor,

    style,
    ...rest
  } = props


  // Ref(s)

  // Method(s)

  // Effect(s)

  // Render
  return (
    <Animated.View>
      <TouchableOpacity
        ref={ref as RefObject<any>}
        style={style}

        onPressIn={onPressIn}
        onPressOut={onPressOut}
        onPress={onPress}
      >
        <FontAwesome5
          name={icon}
          size={iconSize}
          color={iconColor}
        />
      </TouchableOpacity>
    </Animated.View>
  )
});


// END COMPONENT =======================================================================================  END COMPONENT

export default MapButton;

/**
 * End of file src/components/src/app/components/MapButton.tsx
 */