const getAccessToken = async () => {
    try {
      const response = await fetch('/.netlify/functions/getAccessToken');
      const data = await response.json();

      if (response.ok) {
        const accessToken = data.accessToken;
        return accessToken;
      } else {
        console.error('Error fetching access token:', data.error);
      }
    } catch (error) {
      console.error('Error fetching access token:', error);
    }
};


  function fetchRepos(apiUrl, github_accessToken, page, itemsPerPage, username, totalRepos) {
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    // fetch updated repos data desending order
    fetch(`${apiUrl}?page=${page}&per_page=${itemsPerPage}&sort=updated&direction=desc`, {
        headers: {
            Authorization: `Bearer ${github_accessToken}`
        }
    })
        .then(response => response.json())
        .then(repos => {
            displayRepos(repos, github_accessToken, username);
            createPagination(apiUrl, totalRepos, itemsPerPage, page, github_accessToken, username, totalRepos);
        })
        .catch(error => console.error('Error fetching repositories:', error));
}

function displayRepos(repos, github_accessToken, username) {
    const repoList = document.getElementById('repoList');
    repoList.innerHTML = '';

    repos.forEach(repo => {
        getRepoDefaultBranch(repo, github_accessToken, username)
            .then(defaultBranch => {
                const listItem = document.createElement('li');
                listItem.className = 'repo-item';
                listItem.textContent = `${repo.name}`;

                const downloadBtn = document.createElement('button');
                downloadBtn.className = 'download-btn';
                downloadBtn.textContent = 'Download Zip';
                downloadBtn.addEventListener('click', () => downloadRepo(username, repo.name, defaultBranch));

                listItem.appendChild(downloadBtn);
                repoList.appendChild(listItem);
            })
            .catch(error => console.error('Error fetching default branch:', error));
    });
}

function getRepoDefaultBranch(repo, github_accessToken, username) {
    const apiUrl = `https://api.github.com/repos/${username}/${repo.name}`;

    return fetch(apiUrl, {
        headers: {
            Authorization: `Bearer ${github_accessToken}`
        }
    })
        .then(response => response.json())
        .then(repoInfo => repoInfo.default_branch)
        .catch(error => Promise.reject(error));
}

function downloadRepo(username, repoName, defaultBranch) {
    window.open(`https://github.com/${username}/${repoName}/archive/refs/heads/${defaultBranch}.zip`);
}

function createPagination(reposApiUrl, totalItems, itemsPerPage, currentPage, github_accessToken, username, totalRepo) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const paginationElement = document.getElementById('pagination');
    paginationElement.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const pageItem = document.createElement('li');
        pageItem.className = `page-item ${i === currentPage ? 'active' : ''}`;
        pageItem.innerHTML = `<a class="page-link">${i}</a>`;
        paginationElement.appendChild(pageItem);
    }

    attachPaginationClickEvent(reposApiUrl, github_accessToken, itemsPerPage,  username, totalRepo);
}


function changePage(page, reposApiUrl, github_accessToken, itemsPerPage, username, totalRepos) {
    currentPage = page;
    fetchRepos(reposApiUrl, github_accessToken, currentPage, itemsPerPage, username, totalRepos);
}


function attachPaginationClickEvent(reposApiUrl, github_accessToken, itemsPerPage,  username, totalRepos) {
    const paginationLinks = document.querySelectorAll('.page-link');
    paginationLinks.forEach(link => {
        link.onclick = function () {
            const page = parseInt(this.textContent);
            changePage(page, reposApiUrl, github_accessToken, itemsPerPage, username, totalRepos);
        };
    });
}


  (async () => { 
    const github_accessToken = await getAccessToken();

    const username = 'abuanwar072'
    const userApiUrl = `https://api.github.com/users/${username}`
    const reposApiUrl = `https://api.github.com/users/${username}/repos`

    let currentPage = 1, totalRepos = 0
    const itemsPerPage = 30

    // Fetch the total number of public repositories
    fetch(userApiUrl, {
        headers: {
            Authorization: `Bearer ${github_accessToken}`
        }
    })
        .then(response => response.json())
        .then(user => {
            totalRepos = user.public_repos;
            document.getElementById('repoCount').textContent = `Total Public Repositories: ${totalRepos}`;
            fetchRepos(reposApiUrl, github_accessToken, currentPage, itemsPerPage, username, totalRepos);
        })
        .catch(error => console.error('Error fetching the user information:', error));
})();
