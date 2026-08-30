export interface MembershipFlags {
  tf_valid: boolean;
  ntnui_valid: boolean;
}

export interface MembershipStatus {
  valid: boolean;
  label: string;
}

/**
 * Avgjør medlemsstatus ut fra TF- og NTNUI-flaggene.
 * Begge må være betalt for at medlemskapet skal regnes som gyldig.
 */
export const VALID_LABEL = "Gyldig medlem";
export const NOT_FOUND_LABEL = "Ikke funnet";

export const getMembershipStatus = (member: MembershipFlags): MembershipStatus => {
  if (member.tf_valid && member.ntnui_valid) {
    return { valid: true, label: VALID_LABEL };
  }

  if (!member.tf_valid && !member.ntnui_valid) {
    return { valid: false, label: "Mangler TF + NTNUI" };
  }

  return { valid: false, label: member.tf_valid ? "Mangler NTNUI" : "Mangler TF" };
};
