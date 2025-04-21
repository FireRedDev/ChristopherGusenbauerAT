---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: home
title: Christopher Gusenbauers Blog
permalink: /blog/
---
<div class="categories-list">
    <h2>Kategorien</h2>
    <ul>
      {% assign sorted_categories = site.categories | sort %}
      {% for category in sorted_categories %}
        <li>
          <a href="{{ site.baseurl }}/blog/{{ category[0] | slugify | downcase }}/" >{{ category[0] }}</a> ({{ category[1].size }})
        </li>
      {% endfor %}
    </ul>
  </div>