import React, { ComponentType, Fragment, ReactElement } from "react"
import { Image, ImageStyle} from "react-native"
import {
  StyleProp,
  TextStyle,
  TouchableOpacity,
  TouchableOpacityProps,
  View,
  ViewStyle,
} from "react-native"
import { colors, spacing } from "../theme"
import { Text, TextProps } from "./Text"

type Presets = keyof typeof $containerPresets

interface CardProps extends TouchableOpacityProps {

  nomExcursions?: TextProps["text"]

  zone?: TextProps["text"]

  parcours?: TextProps["text"]

  temps?: TextProps["text"]

  distance?: TextProps["text"]

  denivelePositif?: TextProps["text"]

  difficulteParcours?: TextProps["text"]

  difficulteOrientation?: TextProps["text"]

  

  /**
   * One of the different types of text presets.
   */
  preset?: Presets
  /**
   * How the content should be aligned vertically. This is especially (but not exclusively) useful
   * when the card is a fixed height but the content is dynamic.
   *
   * `top` (default) - aligns all content to the top.
   * `center` - aligns all content to the center.
   * `space-between` - spreads out the content evenly.
   * `force-footer-bottom` - aligns all content to the top, but forces the footer to the bottom.
   */
  verticalAlignment?: "top" | "center" | "space-between" | "force-footer-bottom"
  /**
   * Custom component added to the left of the card body.
   */
  LeftComponent?: ReactElement
  /**
   * Custom component added to the right of the card body.
   */
  RightComponent?: ReactElement
  /**
   * The heading text to display if not using `headingTx`.
   */
  heading?: TextProps["text"]
  /**
   * Heading text which is looked up via i18n.
   */
  headingTx?: TextProps["tx"]
  /**
   * Optional heading options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  headingTxOptions?: TextProps["txOptions"]
  /**
   * Style overrides for heading text.
   */
  headingStyle?: StyleProp<TextStyle>
  /**
   * Pass any additional props directly to the heading Text component.
   */
  HeadingTextProps?: TextProps
  /**
   * Custom heading component.
   * Overrides all other `heading*` props.
   */
  HeadingComponent?: ReactElement
  /**
   * The content text to display if not using `contentTx`.
   */
  content?: TextProps["text"]
  /**
   * Content text which is looked up via i18n.
   */
  contentTx?: TextProps["tx"]
  /**
   * Optional content options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  contentTxOptions?: TextProps["txOptions"]
  /**
   * Style overrides for content text.
   */
  contentStyle?: StyleProp<TextStyle>
  /**
   * Pass any additional props directly to the content Text component.
   */
  ContentTextProps?: TextProps
  /**
   * Custom content component.
   * Overrides all other `content*` props.
   */
  ContentComponent?: ReactElement
  /**
   * The footer text to display if not using `footerTx`.
   */
  footer?: TextProps["text"]
  /**
   * Footer text which is looked up via i18n.
   */
  footerTx?: TextProps["tx"]
  /**
   * Optional footer options to pass to i18n. Useful for interpolation
   * as well as explicitly setting locale or translation fallbacks.
   */
  footerTxOptions?: TextProps["txOptions"]
  /**
   * Style overrides for footer text.
   */
  footerStyle?: StyleProp<TextStyle>
  /**
   * Pass any additional props directly to the footer Text component.
   */
  FooterTextProps?: TextProps
  /**
   * Custom footer component.
   * Overrides all other `footer*` props.
   */
  FooterComponent?: ReactElement
}

/**
 * Cards are useful for displaying related information in a contained way.
 * If a ListItem displays content horizontally, a Card can be used to display content vertically.
 *
 * - [Documentation and Examples](https://github.com/infinitered/ignite/blob/master/docs/Components-Card.md)
 */
export function Card(props: CardProps) {
  const {
    nomExcursions,
    zone,
    parcours,
    temps,
    distance,
    denivelePositif,
    difficulteParcours,
    difficulteOrientation,
    content,
    contentTx,
    contentTxOptions,
    footer,
    footerTx,
    footerTxOptions,
    heading,
    headingTx,
    headingTxOptions,
    ContentComponent,
    HeadingComponent,
    FooterComponent,
    LeftComponent,
    RightComponent,
    verticalAlignment = "top",
    style: $containerStyleOverride,
    contentStyle: $contentStyleOverride,
    headingStyle: $headingStyleOverride,
    footerStyle: $footerStyleOverride,
    ContentTextProps,
    HeadingTextProps,
    FooterTextProps,
    ...WrapperProps
  } = props
  
  const favoriIcone = require("../../assets/icons/favori.png")
  const zoneIcone = require("../../assets/icons/zone.png")
  const parcoursIcone = require("../../assets/icons/parcours.png")
  const tempsIcone = require("../../assets/icons/temps.png")
  const distanceIcone = require("../../assets/icons/distance.png")
  const denivelePositifIcone = require("../../assets/icons/denivelePositif.png")
  const difficulteParcoursIcone = require("../../assets/icons/difficulteParcours.png")
  const difficulteOrientationIcone = require("../../assets/icons/difficulteOrientation.png")

  const imageRandonnee = require("../../assets/images/randonnee.png")

  const preset: Presets = $containerPresets[props.preset] ? props.preset : "default"
  const isPressable = !!WrapperProps.onPress
  const isHeadingPresent = !!(HeadingComponent || heading || headingTx)
  const isContentPresent = !!(ContentComponent || content || contentTx)
  const isFooterPresent = !!(FooterComponent || footer || footerTx)

  const Wrapper: ComponentType<TouchableOpacityProps> = isPressable ? TouchableOpacity : View
  const HeaderContentWrapper = verticalAlignment === "force-footer-bottom" ? View : Fragment

  const $containerStyle = [{marginBottom:10, marginTop:10},$containerPresets[preset], $containerStyleOverride]
  const $headingStyle = [
    { maxWidth: "50%", marginEnd: spacing.xl, fontSize: 16},
    $headingPresets[preset],
    (isFooterPresent || isContentPresent) && { marginBottom: spacing.xxxs },
    $headingStyleOverride,
    HeadingTextProps?.style,
  ]



  const $footerStyle = [
    $footerPresets[preset],
    (isHeadingPresent || isContentPresent) && { marginTop: spacing.xxxs },
    $footerStyleOverride,
    FooterTextProps?.style,
  ]
  const $alignmentWrapperStyle = [
    
    $alignmentWrapper,
    { justifyContent: $alignmentWrapperFlexOptions[verticalAlignment] },
    LeftComponent && { marginStart: spacing.md },
    RightComponent && { marginEnd: spacing.md },
  ]

  return (
    <Wrapper
      style={$containerStyle}
      activeOpacity={0.8}
      accessibilityRole={isPressable ? "button" : undefined}
      {...WrapperProps}
    >
      {LeftComponent}

      <View style={$alignmentWrapperStyle}>
        <HeaderContentWrapper>
          
          <View style={$enteteStyle}>
            <Image style={$imageRandoStyle} source={imageRandonnee} resizeMode="contain" />
            <Text
              weight="bold"
              //tx={"carteComposant.titre"}
              text={nomExcursions}
              style={$headingStyle}
            />
            <Image style={$iconeStyle} source={favoriIcone} resizeMode="contain" />
          </View>

          <View style={$tableauInfos}>
            <View style={$ligneSup}>
              <View style={$groupeTexteIconeStyleLigneSup}>
                <Image style={$iconeStyle} source={zoneIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.zone"}
                  text={zone}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneSup}> 
                <Image style={$iconeStyle} source={parcoursIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.parcours"}
                  text={parcours}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneSup}>
                <Image style={$iconeStyle} source={tempsIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.temps"}
                  text={temps}
                  style={$contentStyle}
                />
              </View>
            </View>
            <View style= {$ligneInf}>
              <View style={$groupeTexteIconeStyleLigneInf}>
                <Image style={$iconeStyle} source={distanceIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.distance"}
                  text={distance + " km"}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneInf}>
                <Image style={$iconeStyle} source={denivelePositifIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.denivelePositif"}
                  text={denivelePositif + " m"}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneInf}>
                <Image style={$iconeStyle} source={difficulteParcoursIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.difficulteParcours"}
                  text={difficulteParcours}
                  style={$contentStyle}
                />
              </View>
              <View style={$groupeTexteIconeStyleLigneInf}>
                <Image style={$iconeStyle} source={difficulteOrientationIcone} resizeMode="contain" />
                <Text
                  //tx={"carteComposant.difficulteOrientation"}
                  text={difficulteOrientation}
                  style={$contentStyle}
                />
              </View>
            </View>  
          </View>

            
        </HeaderContentWrapper>

      </View>

      {RightComponent}
    </Wrapper>
  )
}

const $contentStyle: TextStyle = {
  fontSize: 14, 
  maxWidth: "100%", 
  textAlign:"center"
}

const $tableauInfos: ViewStyle = {
  flexDirection: "column",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  paddingStart: spacing.xs,
  paddingEnd: spacing.xs,
  paddingBottom: spacing.xxs
}


const $ligneSup: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  paddingBottom: spacing.xxs,
  minWidth: "100%",
  maxWidth: "100%",
  marginBottom: spacing.xxs
}

const $ligneInf: ViewStyle = {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  paddingStart: spacing.xs,
  paddingEnd: spacing.xs,
  paddingBottom: spacing.xxs,
  minWidth: "100%",
  
}

const $groupeTexteIconeStyleLigneSup: ViewStyle = {
  minWidth: "30%", 
  maxWidth: "30%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  paddingStart: spacing.xs,
  paddingEnd: spacing.xs,
  marginBottom: spacing.xxs,
  
}

const $groupeTexteIconeStyleLigneInf: ViewStyle = {
  minWidth: "20%", 
  maxWidth: "24%",
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",

  //marginVertical: spacing.xs,
  //paddingEnd: spacing.xs
  
}


const $enteteStyle: ViewStyle = {
  //wrappe les deux textes
  flexDirection: "row", 
  alignItems: "center", 
  justifyContent: "space-between",
  paddingStart: spacing.xs,
  paddingEnd: spacing.xs,
  marginBottom: spacing.xxs,
}
//Faire la même chose mais sous forme de grille
const $imageRandoStyle: ImageStyle = {
  width:65,
  height:65,
  //width: "25%", 
  borderRadius:spacing.xs
}

const $listeInfosStyle: ViewStyle = {
  //une grille de deux lignes et 3 colonnes
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  alignItems: "center",
  paddingStart: spacing.xs,
  paddingEnd: spacing.xs,
  paddingBottom: spacing.xxs
}

const $iconeStyle: ImageStyle = {
  width: spacing.lg,
  height: spacing.lg,
  marginEnd: spacing.xxs
}

const $containerBase: ViewStyle = {
  borderRadius: spacing.md,
  padding: spacing.xs,
  borderWidth: 1,
  shadowColor: colors.palette.neutral800,
  shadowOffset: { width: 0, height: 12 },
  shadowOpacity: 0.08,
  shadowRadius: 12.81,
  elevation: 16,
  minHeight: 96,
  flexDirection: "row",
}


const $alignmentWrapper: ViewStyle = {
  flex: 1,
  alignSelf: "stretch",
}

const $alignmentWrapperFlexOptions = {
  top: "flex-start",
  center: "center",
  "space-between": "space-between",
  "force-footer-bottom": "space-between",
} as const

const $containerPresets = {
  default: [
    $containerBase,
    {
      backgroundColor: colors.palette.neutral100,
      borderColor: colors.palette.neutral300,
    },
  ] as StyleProp<ViewStyle>,

  reversed: [
    $containerBase,
    { backgroundColor: colors.palette.neutral800, borderColor: colors.palette.neutral500 },
  ] as StyleProp<ViewStyle>,
}

const $headingPresets: Record<Presets, TextStyle> = {
  default: {},
  reversed: { color: colors.palette.neutral100 },
}

const $contentPresets: Record<Presets, TextStyle> = {
  default: {},
  reversed: { color: colors.palette.neutral100 },
}

const $footerPresets: Record<Presets, TextStyle> = {
  default: {},
  reversed: { color: colors.palette.neutral100 },
}
