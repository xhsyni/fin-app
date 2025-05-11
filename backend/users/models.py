from django.db import models

# Create your models here.
class User(models.Model):
    userid = models.AutoField(primary_key=True, db_column='userid')
    email = models.EmailField(unique=True, db_column='email')
    name = models.CharField(max_length=150, db_column='name')
    phone = models.CharField(max_length=15, db_column='phone', null=True)
    job = models.CharField(max_length=30, db_column='job',  null=True)
    birth_date = models.DateField(db_column='birth_date')
    password = models.CharField(max_length=128, db_column='password')
    created_at = models.DateTimeField(db_column='created_at')
    marital_status = models.BooleanField(db_column='marital_status', default=False)
    ethnicity = models.CharField(max_length=30, db_column='ethnicity', null=True)
    gender = models.CharField(max_length=10, db_column='gender', null=True)
    nationality = models.CharField(max_length=30, db_column='nationality', null=True)

    class Meta:
        db_table = 'user'

    def __str__(self):
        return self.name

class Category(models.Model):
    categoryid = models.AutoField(primary_key=True, db_column='categoryid')
    name = models.CharField(max_length=150, db_column='name')
    is_deductible = models.BooleanField(db_column='isDeductible', default=True)

    class Meta:
        db_table = 'category'

    def __str__(self):
        return self.name
    
class Relationship(models.Model):
    relationshipid = models.AutoField(primary_key=True, db_column='relationshipid')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userid')
    name = models.CharField(max_length=150, db_column='name')
    birth_date = models.DateField(db_column='birth_date', null=True)
    relationship_type = models.CharField(max_length=50, db_column='relationship_type')
    job = models.CharField(max_length=30, db_column='job', null=True)
    expenses = models.DecimalField(max_digits=12, decimal_places=2, db_column='expenses', default=0.00)

    class Meta:
        db_table = 'relationship'

    def __str__(self):
        return self.name
    

class Income(models.Model):
    incomeid = models.AutoField(primary_key=True, db_column='incomeid')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userid')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_column='categoryid')
    datetime = models.DateTimeField(db_column='datetime')
    income_type = models.CharField(max_length=50, db_column='income_type')
    amount = models.DecimalField(max_digits=12, decimal_places=2, db_column='amount')
    job = models.CharField(max_length=30, db_column='job', blank=True, null=True)
    type = models.CharField(max_length=50, db_column='type', blank=True, null=True)

    class Meta:
        db_table = 'income'

    def __str__(self):
        return self.incomeid
    
class File(models.Model):
    fileid = models.AutoField(primary_key=True, db_column='fileid')
    filepath = models.CharField(max_length=255, db_column='filepath')

    class Meta:
        db_table = 'file'

    def __str__(self):
        return self.filepath
    
class Expense(models.Model):
    expenseid = models.AutoField(primary_key=True, db_column='expenseid')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userid')
    datetime = models.DateTimeField(db_column='datetime')
    category = models.ForeignKey(Category, on_delete=models.CASCADE, db_column='categoryid')
    amount = models.DecimalField(max_digits=12, decimal_places=2, db_column='amount')
    type = models.CharField(max_length=30, db_column='type')
    file = models.ForeignKey(File, on_delete=models.SET_NULL, db_column='fileid', null=True)

    class Meta:
        db_table = 'expense'

    def __str__(self):
        return self.expenseid
    
class TaxUser(models.Model):
    taxuserid = models.AutoField(primary_key=True, db_column='taxuserid')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userid')
    tax_year = models.IntegerField(db_column='tax_year')
    tax_income = models.DecimalField(max_digits=12, decimal_places=2, db_column='tax_income')
    amount = models.DecimalField(max_digits=12, decimal_places=2, db_column='amount')
    job = models.CharField(max_length=30, db_column='job', null=True)

    class Meta:
        db_table = 'tax_user'

    def __str__(self):
        return self.taxuserid
    
class Tax(models.Model):
    year = models.IntegerField(db_column='year')
    category = models.CharField(max_length=30, db_column='category')
    charge_income = models.DecimalField(max_digits=12, decimal_places=2, db_column='chargeIncome')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, db_column='taxRate')
    tax_amount = models.DecimalField(max_digits=12, decimal_places=2, db_column='tax_amount')

    class Meta:
        db_table = 'tax'

    def __str__(self):
        return self.year
    
class Notification(models.Model):
    notificationid = models.AutoField(primary_key=True, db_column='notificationid')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='userid')
    title = models.CharField(max_length=150, db_column='title')
    content = models.TextField(db_column='content')
    datetime = models.DateTimeField(db_column='datetime')
    is_read = models.BooleanField(db_column='is_read', default=False)

    class Meta:
        db_table = 'notification'

    def __str__(self):
        return self.title