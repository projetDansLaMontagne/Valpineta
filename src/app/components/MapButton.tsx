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
import {ComponentType, RefObject} from "react";
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
   * An optional ref to access the TouchableOpacity element
   * @type {React.RefObject<TouchableOpacity>}
   */
  ref?: RefObject<TouchableOpacity>

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
const MapButton = (props: MapButtonProps) => {
  // Props
  const {
    onPressIn,
    onPressOut,
    onPress,

    icon,
    iconSize,
    iconColor,

    ref,
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
        ref={ref}
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
}


// END COMPONENT =======================================================================================  END COMPONENT

export default MapButton;

/**
 * End of file src/components/src/app/components/MapButton.tsx
 */
