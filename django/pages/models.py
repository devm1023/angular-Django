from __future__ import unicode_literals

import json

from django.db import models


class Page(models.Model):
    title = models.CharField(max_length=250)
    slug = models.SlugField(max_length=250,
                            unique=True)
    parent = models.ForeignKey('self',
                               null=True)
    updated = models.DateTimeField(verbose_name='Time Updated',
                                   auto_now=True)
    published = models.DateField(verbose_name='Date Published',
                                 null=True,
                                 blank=True,
                                 help_text='dd/mm/yyyy')
    content = models.TextField(verbose_name='Page body',
                               help_text='Use Markdown syntax.')

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

    def _get_json(self):
        return json.dumps({'id': self.id,
                           'title': self.title,
                           'url': '/page/%s' % self.slug,
                           'parentName': self.parent.title,
                           'updated': self.updated.strftime('%Y-%m-%d %H:%M:%S'),
                           'published': self.published.strftime('%Y-%m-%d') if self.published else '',
                           'content': self.content})

    json = property(_get_json)
