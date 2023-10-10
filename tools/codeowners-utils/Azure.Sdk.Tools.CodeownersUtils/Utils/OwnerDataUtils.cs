using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Azure.Sdk.Tools.CodeownersUtils;
using Azure.Sdk.Tools.CodeownersUtils.Constants;
using Azure.Sdk.Tools.CodeownersUtils.Holders;

namespace Azure.Sdk.Tools.CodeownersUtils.Utils
{
    /// <summary>
    /// The OwnerData contains the team/user and user org visibility data as well as methods used for owner (user or team) verification.
    /// </summary>
    public class OwnerDataUtils
    {
        private TeamUserHolder _teamUserHolder = null;
        private UserOrgVisibilityHolder _userOrgVisibilityHolder = null;

        public OwnerDataUtils()
        {
        }

        /// <summary>
        /// OwnerDataUtils constructor that takes a team/user blob storage URI override. This particular
        /// ctor is used by parsing which doesn't do anything with user/org visibility data but is required
        /// to expand teams.
        /// </summary>
        /// <param name="teamUserBlobStorageUri"></param>
        public OwnerDataUtils(string teamUserBlobStorageUri)
        {
            _teamUserHolder = new TeamUserHolder(teamUserBlobStorageUri);
            _userOrgVisibilityHolder = new UserOrgVisibilityHolder(null);
        }

        /// <summary>
        /// OwnerDataUtils that takes overrides for team/user and org/visibility data URI overrides. This
        /// is used by linting which requires both to verify.
        /// </summary>
        /// <param name="teamUserBlobStorageUri"></param>
        /// <param name="userOrgVisibilityBlobStorageUri"></param>
        public OwnerDataUtils(string teamUserBlobStorageUri,
                              string userOrgVisibilityBlobStorageUri)
        {
            _teamUserHolder = new TeamUserHolder(teamUserBlobStorageUri);
            _userOrgVisibilityHolder = new UserOrgVisibilityHolder(userOrgVisibilityBlobStorageUri);
        }

        public OwnerDataUtils(TeamUserHolder teamUserHolder,
                              UserOrgVisibilityHolder userOrgVisibilityHolder)
        {
            _teamUserHolder = teamUserHolder;
            _userOrgVisibilityHolder = userOrgVisibilityHolder;
        }

        /// <summary>
        /// Check whether or not the owner has write permissions.
        /// </summary>
        /// <param name="owner">The login of the owner to check</param>
        /// <returns>True if the owner has write permissions, false otherwise.</returns>
        public bool IsWriteOwner(string owner)
        {
            return _userOrgVisibilityHolder.UserOrgVisibilityDict.ContainsKey(owner);
        }

        /// <summary>
        /// Check whether or not the team has write permissions.
        /// </summary>
        /// <param name="team">The name of the team to check</param>
        /// <returns>True if the team has write permissions, false otherwise.</returns>
        public bool IsWriteTeam(string team)
        {
            var teamWithoutOrg = team.Trim();
            if (teamWithoutOrg.Contains(SeparatorConstants.Team))
            {
                teamWithoutOrg = teamWithoutOrg.Split(SeparatorConstants.Team, StringSplitOptions.TrimEntries)[1];
            }
            return _teamUserHolder.TeamUserDict.ContainsKey(teamWithoutOrg);
        }

        /// <summary>
        /// Check whether or not the user login is a member of of the Azure org
        /// </summary>
        /// <param name="login">The user login to check.</param>
        /// <returns>True, if the user is a member of the Azure org. False, if the user is not a member or not a public member</returns>
        public bool IsPublicAzureMember(string login)
        {
            // If the user isn't in the dictionary then call to get it
            if (_userOrgVisibilityHolder.UserOrgVisibilityDict.ContainsKey(login))
            {
                return _userOrgVisibilityHolder.UserOrgVisibilityDict[login];
            }
            return false;
        }

        /// <summary>
        /// If the team exists in the team user dictionary, return the list of users.
        /// </summary>
        /// <param name="team">The name of the team to expand</param>
        /// <returns>List&gt;string&lt; containing the users, empty list otherwise</returns>
        public List<string> ExpandTeam(string team)
        {
            var teamWithoutOrg = team.Trim();
            if (teamWithoutOrg.Contains(SeparatorConstants.Team))
            {
                teamWithoutOrg = teamWithoutOrg.Split(SeparatorConstants.Team, StringSplitOptions.TrimEntries)[1];
            }
            if (IsWriteTeam(teamWithoutOrg))
            {
                return _teamUserHolder.TeamUserDict[teamWithoutOrg];
            }
            else
            {
                return new List<string>();
            }
        }
    }
}
